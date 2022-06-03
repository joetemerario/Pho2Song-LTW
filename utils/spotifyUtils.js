
var ret = '';

var alreadyChosen = false;

async function getUserTaste(spotifyApi) {
  var data = await spotifyApi.getMyTopTracks({ limit: 100 })

  ids = Array()
  names = Array()
  if (data.body.total < 50) {
    let data = await spotifyApi.getPlaylistTracks('37i9dQZEVXbMDoHDwVN2tF', { limit: 50 })
    for (let track of data.body.items) {
      ids.push(track.track.id);
      names.push(track.track.name);
    }

  }
  if (data.body.total != 0) {
    for (let track of data.body.items) {
      ids.push(track.id);
      names.push(track.name);
    }
  }

  var data = await spotifyApi.getAudioFeaturesForTracks(ids)
  ret = Array()

  //parse dei parametri utili
  var index = 0
  for (let track of data.body.audio_features) {
    ret.push(
      {
        uri: ('spotify:track:' + track.id),
        name: names[index],
        danceability: track.danceability * 255,
        energy: track.energy * 255,
        acousticness: track.acousticness * 255,
      });
    index++
  }
  return ret
}

//funzione algoritmo per matchare ad ogni foto una canzone dagli userTaste dell'utente. Viene chiamata una volta per ogni foto.
async function getSongFromColors(colors, songs, songsChosen) {
  var colors = await colors //palette di colori della corrispettiva foto (ogni colore è in scala RGB)
  var max = null 
  var red = 0;
  var green = 0;
  var blue = 0;

  //calcolo la media tra i colori della palette
  for (colorIndex = 0; colorIndex < colors.length; colorIndex++) {
    red += colors[colorIndex].red
    green += colors[colorIndex].green
    blue += colors[colorIndex].blue
  }
  red = red / colors.length
  green = green / colors.length
  blue = blue / colors.length

  //colore medio in scala RGB
  var averageColor = {
    r: red,
    g: green,
    b: blue,
  }

  //controllo tutte le canzoni all'interno degli userTaste (songs) dell'utente
  for (songIndex = 0; songIndex < songs.length; songIndex++) {
    //controllo se è stata già scelta la stessa canzone
    for(chosenIndex = 0; chosenIndex < songsChosen.length; chosenIndex++){
      if (songs[songIndex].uri == songsChosen[chosenIndex].uri) { 
        alreadyChosen = true;
        break;
      }
    }
    if (alreadyChosen == true){
      alreadyChosen = false;
      continue;
    } 

    if(max == null) max = songs[songIndex]

    //Il colore medio può essere blu, verde, giallo, arancione, rosso, viola, bianco, nero o grigio rispetto a delle condizioni.
    //Es: per il rosso il valore r(red) della scala RGB deve essere maggiore di g(green) e b(blue).

    //una volta scelto a quale colore corrisponde il colore medio, la canzone deve avere caratteristiche maggiori rispetto all'ultima canzone selezionata (max).
    //Ogni valore nella scala RGB è associato ad una caratteristica di una canzone. Lo schema è il seguente:
    //energy: valore R
    //acousticness: valore G
    //danceability: valore B
    //Es: il colore medio è rosso, quindi la canzone corrente deve avere una energy maggiore rispetto all'ultima canzone selezionata (max)

    //rosso 
    if (averageColor.r > averageColor.b && averageColor.r > averageColor.g) {
      //energy 
      if (songs[songIndex].energy > max.energy) {
        max = songs[songIndex]
      }
    }
    //arancione 
    else if (averageColor.r > averageColor.g && averageColor.r > averageColor.b && averageColor.r / averageColor.g < averageColor.r / averageColor.b && averageColor.r / averageColor.g > 1.25) {
      //energy + acousticness
      if (songs[songIndex].energy > max.energy && songs[songIndex].acousticness > max.acousticness) {
        max = songs[songIndex]
      }
    }

    //giallo
    else if (averageColor.r > averageColor.g && averageColor.g > averageColor.b && averageColor.r / averageColor.g <= 1.25 && averageColor.r / averageColor.g >= 0.75 && averageColor.r / averageColor.g < averageColor.r / averageColor.b) {
      //energy + acousticness 
      if (songs[songIndex].energy > max.energy && songs[songIndex].acousticness > max.acousticness) {
        max = songs[songIndex]
      }
    }

    //verde
    else if (averageColor.g > averageColor.r && averageColor.g > averageColor.b) {
      //acousticness
      if (songs[songIndex].acousticness > max.acousticness) {
        max = songs[songIndex]
      }
    }

    //blu
    else if (averageColor.b > averageColor.r && averageColor.b > averageColor.g) {
      //danceability
      if (songs[songIndex].danceability > max.danceability) {
        max = songs[songIndex]
      }
    }

    //viola
    else if (averageColor.b > averageColor.r && averageColor.b > averageColor.g && averageColor.b / averageColor.r > averageColor.b / averageColor.g) {
      //danceability + energy
      if (songs[songIndex].danceability > max.danceability && songs[songIndex].energy > max.energy) {
        max = songs[songIndex]
      }
    }

    //bianco,grigio,nero
    else if (averageColor.r == averageColor.g && averageColor.r == averageColor.b) {
      // danceability, energy e acousticness i più bassi possibile
      if (songs[songIndex].acousticness <= max.acoustiness && songs[songIndex].energy <= max.energy && songs[songIndex.danceability] <= max.danceability) {
        max = songs[songIndex]
      }
    }
  }

  //scegli una foto per i colori
  ret = {
    uri: max.uri,
    name: max.name
  }

  alreadyChosen = false

  return ret
}

//QUesta funzione viene eseguita lato server, al momento di una richeista POST sulla risorsa plist-analyzer
async function analyzePlaylist(spotifyApi, playlistId) {
  /* 
    VARIABILI IN INPUT ALLA FUNZIONE

    spotifyApi: varibile che fa da wrapper per eseguire chiamate API a Spotify
    playlistId: id Spotify della playlist da analizzare, passato a getPlaylistTracks
   */

  var data = await spotifyApi.getPlaylistTracks(playlistId, { limit: 100 }) //Chiedo a Spotify di estrarre gli oggetti "canzone" dalla playlist con id = playlistId
  var ids = Array()

  for (let item of data.body.items) { //Pusho all'interno di un array gli id delle canzoni ottenute dalla chiamata precendete
    ids.push(item.track.id);
  }

  //Inizializzo le variabili che conterranno la media di ogni caratteristica del risultato
  let averageAcousticness = 0, countAcousticness = 0
  let averageDanceability = 0, countDanceability = 0
  let averageEnergy = 0, countEnergy = 0
  let averageInstrumentalness = 0, countInstrumentalness = 0
  let averageLiveness = 0, countLiveness = 0
  let averageLoudness = 0, countLoudness = 0
  let averageSpeechiness = 0, countSpeechiness = 0
  let averageTempo = 0, countTempo = 0

  var data2 = await spotifyApi.getAudioFeaturesForTracks(ids) //Chiedo a Spotify di estrarre le caratteristiche audio da una lista di canzoni precedentemente riempita con gli id di queste ultime

  /* 
    In questa sezione, per ogni traccia analizzata, aggiungo il valore di una caratteristica nella sua variabile corrispondente
    non prima di averla riportata come un valore tra 0 e 100
   */
  for (let track of data2.body.audio_features) {
    if (track !== undefined && track != null) {
      if (track.acousticness !== undefined && track.acousticness != null) {
        averageAcousticness += track.acousticness * 100
        countAcousticness++
      }
      if (track.danceability !== undefined && track.danceability != null) {
        averageDanceability += track.danceability * 100
        countDanceability++
      }
      if (track.energy !== undefined && track.energy != null) {
        averageEnergy += track.energy * 100
        countEnergy++
      }
      if (track.instrumentalness !== undefined && track.instrumentalness != null) {
        averageInstrumentalness += track.instrumentalness * 100
        countInstrumentalness++
      }
      if (track.liveness !== undefined && track.liveness != null) {
        averageLiveness += track.liveness * 100
        countLiveness++
      }
      if (track.loudness !== undefined && track.loudness != null) {
        averageLoudness += track.loudness
        countLoudness++
      }
      if (track.speechiness !== undefined && track.speechiness != null) {
        averageSpeechiness += track.speechiness * 100
        countSpeechiness++
      }
      if (track.tempo !== undefined && track.tempo != null) {
        averageTempo += track.tempo
        countTempo++
      }
    }
  }

  //Infine inserisco nell'oggetto di return la media di queste caratteristiche torncate alla seconda cifra decimale
  var ret = {
    Acousticness: (averageAcousticness / (countAcousticness)).toFixed(2),
    Danceability: (averageDanceability / (countDanceability)).toFixed(2),
    Energy: (averageEnergy / (countEnergy)).toFixed(2),
    Instrumentalness: (averageInstrumentalness / (countInstrumentalness)).toFixed(2),
    Liveness: (averageLiveness / (countLiveness)).toFixed(2),
    Loudness: (averageLoudness / (countLoudness)).toFixed(2),
    Speechiness: (averageSpeechiness / (countSpeechiness)).toFixed(2),
    Tempo: (averageTempo / (countTempo)).toFixed(2)
  }

  return ret
}


module.exports = {
  getUserTaste,
  getSongFromColors,
  analyzePlaylist
}

