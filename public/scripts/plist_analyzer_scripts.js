function showAnalysis(id, place, plist_name) {
    $.ajax({
        type: "post",
        url: "plist-analyzer",
        data: "playlistID=" + id,
        dataType: "json",
        success: function (values) {
            if ($("#sezione-risultato").css("display") == "none") {
                $("#sezione-risultato").css("display", "initial");
            }

            if ($("#stats" + place).css("display") == "none") {
                $("#stats" + place).css("display", "initial");
            }

            if (($("#aggiungi-scelta").css("display") == "none") && ($("#scelta2").css("display") == "none")) {
                $("#aggiungi-scelta").css("display", "initial");
            }

            $("#plist" + place).html(plist_name);
            
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


function choosePlaylistToCompare() {
    document.getElementById("aggiungi-scelta").style.display = "none"

    document.getElementById("scelta2").style.display = "initial"
}

/* Tooltips della Plist Analyzer page */
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})