function displaySongs(playlist){
    var playlistContainer = document.getElementById(playlist + "Songs");
    console.log(playlist + "Songs")
    if(playlistContainer.style.display == "none"){
        playlistContainer.style = "display: initial;"
    }
    else{
        playlistContainer.style = "display: none;"
    } 
}

function displayIsEmpty(){
    if(document.getElementById("playlistItem1") == null){      
        return true;
    } 
    return false;
}

