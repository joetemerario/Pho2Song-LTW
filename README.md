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
        1. __back_to_top_of_page_button_style.css__
        2. __footer_style.css__
        3. __input_style.css__
        4. __landing_page_style.css__
        5. __login_style.css__
        6. __plist_analyzer_style.css__
        7. __plist_history_style.css__
        8. __result_style.css__
    * images
    * scripts
        1. __back_to_top_of_page_script.js__
        2. __input_scripts.js__
        3. __main_reslts_scripts.js__
        4. __navbar_scripts.js__
        5. __plist_analyzer_scripts.js__
        6. __plist_history_scripts.js__ : file JavaScript contenente gli script per la pagina plist-history.ejs. 
            1. _displaySongs(playlist)_ : funzione chiamata premendo il pulsante riferito ad una playlist. La visualizza se nascosta o viceversa.
* utils
    1. __googleUtils.js__
    2. __spotifyUtils.js__ : file JavaScript contenente tutte le funzioni che richiedono l'utilizzo delle API di Spotify.
        1. _getUserTaste(spotifyApi)_ :
        2. _getSongFromColors(colors, songs, songsChosen)_ : funzione che rappresenta l'algoritmo di scelta di una canzone per ogni foto data in input dall'utente.
        3. _analyzePlaylist(spotifyApi, playlistID)_ : 
* views
    * pages
        1. __input.ejs__
        2. __landing_page.ejs__
        3. __login.ejs__ : pagina di login in cui l'utente può accedere al suo account o registrarsi su Spotify
        4. __plist-history.ejs__ : pagina della funzionalità Playlist History che permette all'utente di visualizzare le playlist salvate tramite Pho2Song
        5. __plist-analyzer.ejs__
        6. __result.ejs__
    * partials
        1. __footer.ejs__
        2. __navbar.ejs__
* __index.js__
* __package.json__

