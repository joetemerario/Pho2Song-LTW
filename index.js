require('dotenv').config()

const express = require('express');
const path = require("path");
const passport = require('passport');

const flash = require('express-flash')
const session = require('express-session')

const methodOverride = require('method-override')
const NodeCouchDb = require('node-couchdb');

var SpotifyWebApi = require('spotify-web-api-node');

const SpotifyStrategy = require('passport-spotify').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const spotifyUtils = require("./utils/spotifyUtils.js");
const googleUtils = require('./utils/googleUtils.js')

const bodyParser = require('body-parser');
const multer = require('multer');			//Abilita il file upload verso il server

const {extractColors} = require("extract-colors")	//Funzione per estrazione di colori dalle foto in locale, senza utilizzare le API di Imagga

/************************************************************  CouchDb setup ***********************************************************/
const couch = new NodeCouchDb({
	auth: {
		user: process.env.DB_USER,
		pass: process.env.DB_PASSWORD
	}
})

const dbName = 'p2splaylists';
const viewUrl = '_design/all_playlists/_view/all';

function view(doc) {
	emit(doc._id, {name: doc.name, user: doc.user, song_number: doc.song_number, songs: doc.songs});
  }

/************************************************************  Passport setup ***********************************************************/

/* passport è stato utilizzato sia per l'autenticazione tramite google e spotify, sia come gestore di sessione */


//STRATEGIA PASSPORT SPOTIFY

const spotify_users = new Map();
const spotify_timers = new Map();
const spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const spotify_scopes = [
	'ugc-image-upload',
	'user-read-playback-state',
	'user-modify-playback-state',
	'user-read-currently-playing',
	'streaming',
	'app-remote-control',
	'user-read-email',
	'user-read-private',
	'playlist-read-collaborative',
	'playlist-modify-public',
	'playlist-read-private',
	'playlist-modify-private',
	'user-library-modify',
	'user-library-read',
	'user-top-read',
	'user-read-playback-position',
	'user-read-recently-played',
	'user-follow-read',
	'user-follow-modify'
];//da ottimizzare

passport.use('spotify',
	new SpotifyStrategy({
		clientID: spotify_client_id,
		clientSecret: spotify_client_secret,
		callbackURL: '/spotify-login/callback'
	},
		async function (accessToken, refreshToken, expiresIn, profile, done) {//verify callback per spotify
			let spotifyApi=  new SpotifyWebApi({
				clientId: spotify_client_id,
				clientSecret: spotify_client_secret,
			})

			//Setto accessToken e refreshToken ottenuti dalla strategia passport
			
			spotifyApi.setAccessToken(accessToken);
			spotifyApi.setRefreshToken(refreshToken);
			let tastes =await spotifyUtils.getUserTaste(spotifyApi)//ottengo i gusti dell'utente

			//gestisco il refreshtoken automatizzando la richiesta di un nuovo accesstoken
			let intervalID=	setInterval(async () => {
				let data = await spotifyApi.refreshAccessToken();
				let access_token = data.body['access_token'];
				spotifyApi.setAccessToken(access_token);
				console.log('accesstoken refreshed')
			  }, expiresIn / 2 * 1000);
			spotify_timers.set(profile.id,intervalID)

			let prof_pic
			if(profile.photos.length==0)prof_pic = './images/skuffed_def_prof_pic_spotify.jpg'
			else prof_pic = profile.photos[0].value

			
			spotify_users.set(profile.id,{//registro i dati dell'utente pronti per essere deserializzati
				id: profile.id,
				name: profile.displayName,
				prof_pic: prof_pic,
				accessToken: accessToken,
				//timer: intervalID,
				tastes: tastes,

				accessTokenGoogle: '',
				albums: null
			})
			return done(null,profile);
			
		}
	)
)

//STRATEGIA PASSPORT GOOGLE

const google_client_id = process.env.GOOGLE_CLIENT_ID;
const google_client_secret = process.env.GOOGLE_CLIENT_SECRET;
const google_scopes=[
	'https://www.googleapis.com/auth/photoslibrary.readonly', 
	'https://www.googleapis.com/auth/userinfo.profile'
]
const google_users=new Map();
passport.use('google',
	new GoogleStrategy({
		clientID: google_client_id,
		clientSecret: google_client_secret,
		callbackURL: '/google-login/callback'
	},
		async function (accessToken, refreshToken, profile, cb) {//verify callback per spotify
			//ottengo gli album dell'utente tramite accessToken
			
			let data = await googleUtils.getAlbums(accessToken)
			google_users.set(profile.id,{
				id: profile.id,
				albums: data,
				accessToken: accessToken
			})
			return cb(null, profile)
		})
)
//serializza Utente
passport.serializeUser(function (user, done) {
	done(null, user.id); 
})

//deserializza Utente
passport.deserializeUser(function (id, done) {

	let user=spotify_users.get(id)
	if(user!=null){
		done(null, user)
	}
	else{
		user=google_users.get(id)
		done(null, user) 
		//google_users.delete(id)
	}
})
function checkAuthenticated(req, res, next) { //controllo se l'utente è autenticato
	if (req.isAuthenticated()) {
		return next()
	}
	return res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) { //controllo se l'utente NON è autenticato
	if (req.isAuthenticated()) {
		return res.redirect('/')
	}
	return next()
}
/**************************************************************  Multer Setup ************************************************************************/

/* multer è stato utilizzato per gestire l'input tramite file della funzionalità principale */

const fileStorageEngine = multer.diskStorage({
	destination: (req, file, callback) => {
	  callback(null, './public/images')
	},
	filename: (req, file, callback) => {
	  callback(null, Date.now()  + '--' + file.originalname);
	}
});

const upload = multer({ storage : fileStorageEngine })





const app = express();
/**************  Mounting vari **************/

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
	secret: process.env.SESSION_SECRET || "secret",
	resave: false,
	saveUninitialized: false
}))
app.use(passport.session())

app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, "/public")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/********************************************** Routing section of the server setup *********************************************************/

/* sono state utilizzare le due funzioni middleware checkAuthenticated e checkNotAuthenticated prima di 
gestire le richieste per verificare che l'utente sia loggato e che quindi abbia effettivamente accesso alla risorsa richiesta */

/**************************  Gestione della home ****************************/

app.get('/',(req, res) => {
	let p2sUser = null
	if(req.session.user !==undefined &&  req.session.user != null){
		p2sUser = {
			username: req.session.user.name,
			user_image: req.session.user.prof_pic
		}
	}
	res.render('./pages/landing_page.ejs', { p2sUser: p2sUser })/*render della pagina landing_page.ejs*/

})
/**************  Gestione di login e delle varie autenticazioni **************/
app.get('/login', checkNotAuthenticated, (req, res) => {
	let p2sUser=null
	if(req.session.user!==undefined){
		p2sUser={
			username: req.session.user.name,
			user_image: req.session.user.prof_pic
		} 
	}
	res.render('./pages/login.ejs', {p2sUser: p2sUser})
})

app.post('/logout', checkAuthenticated, (req, res) => {
	spotify_users.delete(req.session.user.id);
	clearInterval(spotify_timers.get(req.session.user.id));
	spotify_timers.delete(req.session.user.id)
	req.logout()
	userData.delete(req.session.user.id)
	req.session.user=undefined;
	res.redirect('/')
})

//Passport.authenticate per ottenere l'autorizzazione nell'utilizzare i dati dell'utente, ottengo access code
app.get('/spotify-login', checkNotAuthenticated, passport.authenticate('spotify', { scope: spotify_scopes }));

//Passport.authenticate per autenticare, on callback viene richiamata la verify callback di passport definita precedentemente
app.get('/spotify-login/callback', checkNotAuthenticated,passport.authenticate('spotify', {
	successRedirect: '/spotify-login/callback/return',
	failureRedirect: '/'
}))
app.get('/spotify-login/callback/return',checkAuthenticated,function(req,res){
	if(req.session.user===undefined){
		req.session.user=req.user //monto nella sessione i dati utili dell'utente deserializzato rendendoli accessibili ovunque lui vada
	}
	res.redirect('/')
})


//per google anche se non strettamente necessario è stato utilizzato lo stesso "flow" utilizzato per spotify 


//Passport.authenticate per ottenere l'autorizzazione nell'utilizzare lo scope photoslibrary.readonly dell'utente, ottengo access code
app.get('/google-login', checkAuthenticated, passport.authenticate('google', { scope: google_scopes }));


//Passport.authenticate per autenticare, on callback viene richiamata la verify callback di passport definita precedentemente
app.get('/google-login/callback', checkAuthenticated, passport.authenticate('google', {
	successRedirect: '/google-login/callback/return',
	failureRedirect: '/input'
}));
app.get('/google-login/callback/return',checkAuthenticated ,function(req,res){
	req.session.user.albums=req.user.albums
	req.session.user.accessTokenGoogle=req.user.accessToken //aggiungo alla sessione i dati utili dell'utente google deserializzato 
	res.redirect('/input')
})

/************** Gestione della funzionalità principali Photo to Song **************/

/* Gestione dell'input */
app.get('/input', checkAuthenticated, function (req, res) { 
	res.render('./pages/input.ejs', 
	{ 
		albums: req.session.user.albums,//passo in rendering della pagina di input gli albums di google se presenti
		logged: req.session.user.accessTokenGoogle!='', 
		p2sUser: {
			username: req.session.user.name,
			user_image: req.session.user.prof_pic
		} 
	})
});
app.post('/checkUrl', async function (req, res) { // verifica preventiva che l'url sia accessibili dal nostro server (ad esempio non abbiamo accesso a foto di wikipedia)
	try {
		let colors = await extractColors(req.body.url)
	} catch (e) {
		res.send(false);
		return
	}
	res.send(true)
	
});


/* Gestione del risultato */

const userData = new Map();

app.post('/result',upload.array("images", 50), checkAuthenticated, function (req, res) {
	userData.set(req.session.user.id,{// ogni volta che un utente effettua una post a questa risorsa viene creata una struttura che avrà come chiave di accesso il suo id
		photos: Array(),//foto in input
		names: Array(),//nomi delle foto in input
		songsDB: Array(),// struttura da inserire in un documento del database se l'utente decide di salvare la playlist
		songsChosen: Array()// struttura utile solo per evitare la ripetizione di una canzone in una richiesta
	})
	p2sUser={
		username: req.session.user.name,
		user_image: req.session.user.prof_pic
	}

	/* in base al tipo di input preparo le strutture sopra elencate prima di renderizzare la pagina dei risultati.
	In particolare nella struttura photos verranno salvate le foto della richiesta dell'utente. Da questa struttura ad ogni chiamata ajax a getSong verrà prelevata una foto e analizzata. 
	Inoltre vengono preparati i nomi per le foto per il database e per la funzionalità plist history e vengono preparati url o path per il carosello della pagina result.ejs*/


	if (req.files) {//caso files
		userData.get(req.session.user.id).photos=req.files;
		let photos=userData.get(req.session.user.id).photos
		let names=userData.get(req.session.user.id).names
		if(photos.length!=0){
			let urls=Array();
			
			for (let index = 0; index < userData.get(req.session.user.id).photos.length; index++) {//prendo il nome del file e preparo il path per ogni file
				names.push(photos[index].path.substring(photos[index].path.indexOf("-") + 2))
				urls.push(photos[index].path.substring(6));
			}
			
			res.render('./pages/result.ejs', { urls:urls, num: photos.length, p2sUser: p2sUser })
		}
		else res.redirect('/input');
	}
	else if (req.body.urls) {//caso url
		let photos=userData.get(req.session.user.id).photos
		let names=userData.get(req.session.user.id).names
		try{
			req.body.urls.forEach(element=>{//utilizzo l'url stesso sia come nome sia come reference alla foto
				photos.push(element)
				names.push(element)
			})
		}catch(e){
			photos.push(req.body.urls)
			names.push(req.body.urls)
		}
		if(photos.length!=0){
			res.render('./pages/result.ejs', { urls: photos,num: photos.length, p2sUser: p2sUser })
		}
	}
	else if (req.body.album) {//caso album di google
		i = req.body.album
		let album=req.session.user.albums[i]
		
		googleUtils.getPhotos(req.session.user.accessTokenGoogle,album.id)
			.then(data => {
				let photos=userData.get(req.session.user.id).photos
				let names=userData.get(req.session.user.id).names
				data.forEach(element => { //concateno <titolo dell'album>.<nome della foto> come nome delle foto per il DB 
					names.push( album.title + "." + element.filename );
					photos.push(element.baseUrl)//utilizzo l'url della foto di google foto come reference alla foto
				});


				res.render('./pages/result.ejs', { urls:photos,num: photos.length, p2sUser: p2sUser })
			})
	}
	else res.redirect('/input');
	
})
/* Gestione delle richieste di save delle playlist*/
app.post('/playlist', checkAuthenticated, function (req, res) {

	let songsDB = Array.from(userData.get(req.session.user.id).songsDB)
	if (songsDB.length == 0) res.redirect('/input')
	let spotifyApi = new SpotifyWebApi({
		clientId: spotify_client_id,
		clientSecret: spotify_client_secret,
	})
	spotifyApi.setAccessToken(req.session.user.accessToken)
	let selectedSongs=Array()
	try {
		req.body.songs.forEach(element => {
			selectedSongs.push(element)
		})
	} catch (e) {
		selectedSongs.push(req.body.songs)
	}
	try {
		spotifyApi.createPlaylist(req.body.name || 'Il mio album in musica', {// creo una nuova playlist
			'description': req.body.description
		}).then(data => {//aggiungo le tracce selezionate nella nuova playlist (se presenti)
			console.log(data.body.id)
			if (selectedSongs) {
				spotifyApi.addTracksToPlaylist(data.body.id, selectedSongs)
			}
		})
	} catch (e) {
		console.log(e)
	}
	
	songsDB=songsDB.filter(songImg => selectedSongs.includes(songImg.song.uri)) // filtro le canzoni in base alle canzoni che l'utente ha selezionato

	/* Struttura di un documento (playlist) nel database:

	{
		_id: id del documento 
		name: nome della playlist
		user: id dell'utente che possiede questa playlist
		description: descrizione della playlist
		song_number: numero di canzoni nella playlist
		songs: [
			{
				song: {
					uri: uri della canzone
					name: nome della canzone
				}
				photo: foto correlata alla canzone 
			}
		]
	}

	*/

	couch.uniqid().then((ids) => {// aggiungo la playlist al DB
        const id = ids[0]
		couch.insert(dbName, {
			_id: id,
			name: req.body.name,
			user: req.session.user.id,
			description: req.body.description,			
			song_number: selectedSongs.length,
			songs: songsDB 
		})
	})
	res.redirect('/')
})
/* Gestione delle richieste ajax lanciate dallo script getSong del file main_result_scripts.js*/
app.get('/getSong',checkAuthenticated,async function (req, res) {
	let data	
	try{
		let photo = userData.get(req.session.user.id).photos.pop();//prendo una foto
		let imgName = userData.get(req.session.user.id).names.pop();
		if (photo == null) data=null
		else{
			let song
			if(photo.path !== undefined){//verifico se in input ho un file o un url
				song = await spotifyUtils.getSongFromColors(extractColors(photo.path), req.session.user.tastes, userData.get(req.session.user.id).songsChosen)//scelgo la canzone
				userData.get(req.session.user.id).songsChosen.push(song)				
			}
			else{
				song = await spotifyUtils.getSongFromColors(extractColors(photo), req.session.user.tastes, userData.get(req.session.user.id).songsChosen)//scelgo la canzone	
				userData.get(req.session.user.id).songsChosen.push(song)
			}
		
			userData.get(req.session.user.id).songsDB.push({
				song: song,
				photo: imgName
			})//inserisco nella struttura relativa all'utente
			data=song
		}
	}catch(e){
		console.log(e)
		data='error'
	}
	if (data=='error') res.redirect('/')
	else if (data) res.send(data)/* se le foto non erano finite mando la canzone scelta */
	else res.send('end')
})

/************** Funzionalità: Playlist analyzer **************/

//Richiesta GET per renderizzare la page Playlist Analyzer
app.get('/plist-analyzer', checkAuthenticated, (req, res) => {
	let spotifyApi=  new SpotifyWebApi({
		clientId: spotify_client_id,
		clientSecret: spotify_client_secret,
	})
	spotifyApi.setAccessToken(req.session.user.accessToken)	//Setto l'Access Token nel wrapper per poter effettuare le chiamate API a Spotify

	spotifyApi.getUserPlaylists(req.session.user.id,{limit: 50}).then(data => {	//Chiedo a Spotify di restituirmi le playlist dell'utente (il cui id è ottenuto dalla sessione attualmente attiva) e ne limito il numero a 50

		var playlists = data.body.items.filter(item=>item.tracks.total != 0) //Elimino dalle playlist ottenute quelle che non hanno canzoni al loro interno
		res.render('./pages/plist-analyzer.ejs', {playlists: playlists, p2sUser: {
			username: req.session.user.name,
			user_image: req.session.user.prof_pic
		}})  /* Invia al frontend le playlist da cui l'utente sceglie quella da anallizare */
	})
})

//Richiesta POST che chiama la funzione analyzePlaylist
app.post('/plist-analyzer', (req, res) => {
	let spotifyApi=  new SpotifyWebApi({
		clientId: spotify_client_id,
		clientSecret: spotify_client_secret,
	})
	spotifyApi.setAccessToken(req.session.user.accessToken)	//Come sopra
	spotifyUtils.analyzePlaylist(spotifyApi, req.body.playlistID).then(data => {	//Analizzo la playlist, il cui id si trova nel corpo della request, e restituisco il risultato al mittente
		res.send(data)
	})
})

/************** Funzionalità: Playlist History ******************* */

app.get('/plist-history', checkAuthenticated, (req, res) => {
	// Viene eseguita una get sul database tramite la view (ottiene tutti i documenti con tutti i parametri). 
	// Poi viene dato in input per il render a plist-history.ejs p2sUser, contenente username, user id e immagine del profilo dell'utente in sessione, 
	// e tutte le playlist ottenute dal get al database
	couch.get(dbName, viewUrl ).then( 
        (data, headers, status) => {
			res.render('./pages/plist-history.ejs', {
				p2sUser: {
					username: req.session.user.name,
					id: req.session.user.id,
					user_image: req.session.user.prof_pic
				},
				p2splaylists: data.data.rows.reverse()
				})
			},
        (err) => {
            res.send(err);
        }
    );
})
//metto il server in ascolto
app.listen(8888, () => {
	console.log('Server listening on http://localhost:8888/');
});
