# Pho2Song
### Cose da fare
escludendo i dettagli
##### Frontend
- [x] result.ejs
- [x] input.ejs
- [x] p.list compare
- [x] pagina storico
##### Backend
- [x] algoritmo scelta canzoni
- [x] database

##### File

* public
    * css
        1. __back_to_top_of_page_button_style.css__ : foglio di stile per il componente multipagina che permette di tornare in cima alla scheda.
        2. __footer_style.css__ : foglio di stile per il componente parziale __footer.ejs__.
        3. __input_style.css__ : foglio di stile della pagina __input.ejs__.
        4. __landing_page_style.css__ : foglio di stile per la pagina __landing_page.ejs__.
        5. __login_style.css__ : foglio di stile per la pagina __login.ejs__.
        6. __plist_analyzer_style.css__ : foglio di stile per la pagina __plist-analyzer.ejs__.
        7. __plist_history_style.css__ : foglio di stile per la pagina __plist-history.ejs__.
        8. __result_style.css__ : foglio di stile della pagina __result.ejs__.
    * images
    * scripts
        1. __back_to_top_of_page_script.js__ : file JavaScript contenente gli script per far funzionare il bottone per tornare in cima alla pagina.
            1. _scrollFunction()_ : funzione che in base al valore di __window.scrollY__ mostra o nasconde il bottone per tornare in cima alla pagina.
            2. _backToTop()_ : funzione che chiama il metodo _scrollTo(0, 0)_ di __window__, per tornare in cima alla pagina.
        2. __input_scripts.js__ : file JavaScript contenente gli script per la pagina  __input.ejs__.
            1. _annihilateWholeLineage()_ : funzione che elimina tutti i componenti list item da una unordered list con id = "#files-list".
            2. _manageSubmitButton(dim)_ : funzione che attiva o disattiva il bottone di submit a seconda del numero di file pronti per l'invio al server.
            3. _showFilesPreview(inputFiles)_ : funzione che mostra a schermo la lista dei file attualmente in input nella form di invio.
            4. _isValidHttpUrl(string)_ : controlla che l'input sia un url.
            5. _isNew(url)_ : controlla che l'input non sia stato già inserito.
            6. _isImage(url)_ : controlla che l'input sia un immagine di un formato valido.
            7. _reloadInputText(target)_ : nasconde il campo input e ne genera uno nuovo. 
            8. _invalidateInputText(target)_ :  cancella il campo input e ne genera uno nuovo. 
            9. _addImage()_ : gestisce l'inserimento degli url.
            10. _display(urlInput)_ : gestisce il display di un url.
            11. _UrlDelete(url,id)_ : cancella l'url dagli input.
        3. __main_results_scripts.js__ :  file JavaScript contenente gli script per la pagina  __result.ejs__.
            1. _getSong()_ : funzione che si occupa di lanciare chiamate ajax in numero pari al numero di foto in input e di mettere in display la risposta (uri e nome della canzone).
            2. _checkAll()_ : funzione chiamata alla pressione del tasto 'seleziona tutte', mette checked tutte le checkbox.
            3. _checkValid(id)_ : verifica ad ogni click su una checkbox se il tasto 'salva questa playlist' deve essere abilitato (se almeno una canzone è stata selezionata).
        4. __navbar_scripts.js__ : file JavaScript contenente gli script del parziale __navbar.ejs__
            1. _highlightLink(id)_ : funzione che illumina il bottone della navbar con id = __id__
        5. __plist_analyzer_scripts.js__ : file JavaScript contenente gli script per la pagina __plist-analyzer.ejs__.
            1. _showAnalysis(id, place, plist_name)_ : funzione che tramite chiamata Ajax, richiede al server i risultati dell'analisi della playlist individuata da __id__ e li mostra a schermo.
            2. _choosePlaylistToCompare()_ : funzione che nasconde il tasto per far apparire la seconda lista di playlist e mostra quest'ultima a schermo.
        6. __plist_history_scripts.js__ : file JavaScript contenente gli script per la pagina __plist-history.ejs__. 
            1. _displaySongs(playlist)_ : funzione chiamata premendo il pulsante riferito ad una playlist. La visualizza se nascosta o viceversa.
* utils
    1. __googleUtils.js__ : file JavaScript contenente tutte le funzioni che richiedono l'utilizzo delle API di Google.
        1. _getAlbums(accessToken)_ : richiede gli album dell'utente
        2. _getPhotos(accessToken, albumId)_ : richiede le foto dell'album  __albumId__ dell'utente
    2. __spotifyUtils.js__ : file JavaScript contenente tutte le funzioni che richiedono l'utilizzo delle API di Spotify.
        1. _getUserTaste(spotifyApi)_ : funzione che ottiene le canzoni preferite dell'utente e ne analizza le caratteristiche
        2. _getSongFromColors(colors, songs, songsChosen)_ : funzione che rappresenta l'algoritmo di scelta di una canzone per ogni foto data in input dall'utente.
        3. _analyzePlaylist(spotifyApi, playlistID)_ : funzione che estrae le canzoni dalla playlist __playlistID__, le analizza, fa una media delle loro statistiche e le restituisce sotto forma di un oggetto.
* views
    * pages
        1. __input.ejs__ : pagina adibita al input delle foto per la funzionalità Photo to Song.
        2. __landing_page.ejs__
        3. __login.ejs__ : pagina di login in cui l'utente può accedere al suo account o registrarsi su Spotify.
        4. __plist-history.ejs__ : pagina della funzionalità Playlist History che permette all'utente di visualizzare le playlist salvate tramite Pho2Song.
        5. __plist-analyzer.ejs__ : pagina della funzionalita Playlist Analyzer che permette all'utente di scegliere una delle sue playlist Spotify e analizzarla per visualizzare le statistiche medie di quella playlist e nel caso, confrontarle con quelle di una   seconda playlist.
        6. __result.ejs__ : pagina adibita alla visualizzazione dei risultati della funzionalità Photo to Song.
    * partials
        1. __footer.ejs__ : parziale che contiene il codice html del footer che sta ai piedi di ogni pagina.
        2. __navbar.ejs__ : parziale che contiene il codice html della navbar che sta in testa ad ogni pagina.
* __index.js__ : gestione dei routing e settaggio di passport per autenticazione e sessioning.
* __package.json__

