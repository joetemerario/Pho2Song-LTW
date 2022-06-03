//Ogni volta che un check radio viene cliccato, questa funzione parte
function showAnalysis(id, place, plist_name) {
    /*  VARIABILI IN INPUT ALLA FUNZIONE
        id: id della playlist Spotify inviato al server nel corpo della richesta POST Ajax, utile alla funzione analyzePlaylist
        place: variabile che vale 1 o 2, che identifica da quale delle 2 liste di playlist è stata invocata la funzione e di conseguenza permette di scegliere in quale sezione della pagina html mostrare i risultati dell'analisi
        plist_name: nome della playlist utilizzato per mostrare dinamicamente sulla pagina html il nome della playlist che viene analizzata
     */
    $.ajax({    //Utilizzo JQuery per effettuare una chiamata Ajax asincrona, precisamente una POST che mi serve per inviare al server l'id della playlist da analizzare
        type: "post",
        url: "plist-analyzer",
        data: "playlistID=" + id,
        dataType: "json",
        success: function (values) {    //Quando il server mi invia la risposta accedo al corpo di quest'ultima per ottenre i dati che mi servono
            /* 
                In questa prima sezione accedo, sempre tramite JQuery, all'attributo style delle sezioni in cui mostrare i risultati dell'analisi
                in base al valore di place ricevuto in input dalla funzione, e ne cambio il valore di display
             */

            if ($("#sezione-risultato").css("display") == "none") { 
                $("#sezione-risultato").css("display", "initial");
            }

            if ($("#stats" + place).css("display") == "none") {
                $("#stats" + place).css("display", "initial");
            }

            if (($("#aggiungi-scelta").css("display") == "none") && ($("#scelta2").css("display") == "none")) { //Qui mostro a schermo il tasto per far apparire la seconda lista di playlist nel caso in cui la funzione non fosse mai stata invocata con place = 2
                $("#aggiungi-scelta").css("display", "initial");
            }

            $("#plist" + place).html(plist_name);   //Mostro dinamicamente il nome della playlist che l'utente ha deciso di analizzare

            /* 
                In questa sezione monto una stringa che contiene del codice html con all'interno delle progress bar che mostrano i valori che ho ottenuto dall'analisi della playlist
                e la insersisco all'interno del li corrispondente alla statistica
             */
            
            let string = ''

            if (place == 1) {
                string = '<div class="progress-bar" role="progressbar" style="width:' + values.Acousticness + '%;" aria-valuenow=" ' + values.Acousticness + ' " aria-valuemin="0" aria-valuemax="100">' + values.Acousticness + '%</div>'
            }
            else {
                string = '<div class="progress-bar" role="progressbar" style="width:' + values.Acousticness + '%;" aria-valuenow=" ' + values.Acousticness + ' " aria-valuemin="0" aria-valuemax="100">' + values.Acousticness + '%</div>'
            }
            
            $("#acousticness" + place).html(string);

            if (place == 1) {
                string = '<div class="progress-bar" role="progressbar" style="width:' + values.Danceability + '%;"aria-valuenow=" ' + values.Danceability + ' " aria-valuemin="0"aria-valuemax="100">' + values.Danceability + '%</div>'
            }
            else {
                string = '<div class="progress-bar" role="progressbar" style="width:' + values.Danceability + '%;" aria-valuenow=" ' + values.Danceability + ' " aria-valuemin="0"aria-valuemax="100">' + values.Danceability + '%</div>'
            }
            
            $("#danceability" + place).html(string);

            if (place == 1) {
                string = '<div class="progress-bar" role="progressbar" style="width:' + values.Energy + '%;" aria-valuenow=" ' + values.Energy + ' " aria-valuemin="0"aria-valuemax="100">' + values.Energy + '%</div>'
            }
            else {
                string = '<div class="progress-bar" role="progressbar" style="width:' + values.Energy + '%;" aria-valuenow=" ' + values.Energy + ' " aria-valuemin="0"aria-valuemax="100">' + values.Energy + '%</div>'
            }
            
            $("#energy" + place).html(string);

            if (place == 1) {
                string = '<div class="progress-bar" role="progressbar" style="width:' + values.Instrumentalness + '%;"aria-valuenow=" ' + values.Instrumentalness + ' " aria-valuemin="0"aria-valuemax="100">' + values.Instrumentalness + '%</div>'
            }
            else {
                string = '<div class="progress-bar" role="progressbar" style="width:' + values.Instrumentalness + '%;" aria-valuenow=" ' + values.Instrumentalness + ' " aria-valuemin="0"aria-valuemax="100">' + values.Instrumentalness + '%</div>'
            }
            
            $("#instrumentalness" + place).html(string);

            if (place == 1) {
                string = '<div class="progress-bar" role="progressbar" style="width:' + values.Liveness + '%;"aria-valuenow=" ' + values.Liveness + ' " aria-valuemin="0"aria-valuemax="100">' + values.Liveness + '%</div>'
            }
            else {
                string = '<div class="progress-bar" role="progressbar" style="width:' + values.Liveness + '%;" aria-valuenow=" ' + values.Liveness + ' " aria-valuemin="0"aria-valuemax="100">' + values.Liveness + '%</div>'
            }
            
            $("#liveness" + place).html(string);

            if (place == 1) {
                string = '<div class="progress-bar" role="progressbar" style="width:' + values.Speechiness + '%;"aria-valuenow=" ' + values.Speechiness + ' " aria-valuemin="0"aria-valuemax="100">' + values.Speechiness + '%</div>'
            }
            else {
                string = '<div class="progress-bar" role="progressbar" style="width:' + values.Speechiness + '%;" aria-valuenow=" ' + values.Speechiness + ' " aria-valuemin="0"aria-valuemax="100">' + values.Speechiness + '%</div>'
            }
            
            $("#speechiness" + place).html(string);

            if (place == 1) {
                string = '<h6>Volume medio in decibel: ' + values.Loudness + ' dB</h6>'
            } else {
                string = '<h6>' + values.Loudness + ' dB: ' + 'Volume medio in decibel</h6>'
            }
            
            $("#loudness" + place).html(string);

            if (place == 1) {
                string = '<h6>Tempo medio: ' + values.Tempo + ' BPM</h6>'
            }
            else {
                string = '<h6>' + values.Tempo + ' BPM: ' + 'Tempo medio</h6>'
            }
            
            $("#tempo" + place).html(string);
        }
    });
}

//Questa funzione si attiva alla pressione del tasto per far comparire la seconda lista di playlist e non fa altro che nascondere tale tasto e visualizzare la seconda lista
function choosePlaylistToCompare() {
    document.getElementById("aggiungi-scelta").style.display = "none"

    document.getElementById("scelta2").style.display = "initial"
}

/* Tooltips della Plist Analyzer page */

//Si può vedere passando il puntatore sul tasto per far comparire la seconda lista di playlist
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})