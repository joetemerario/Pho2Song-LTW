//Funzione chiamata sull'evento onload delle pagine corrispondenti alle tre funzionalità principali (Photo to Song, Playlist Analyzer e Playlist History)
function highlightLink(id) {
    /* 
        VARIABILI IN INPUT ALLA FUNZIONE

        id: id del componente html da illuminare all'interno della navbar
     */
    let navLinks = document.getElementsByClassName("nav-link")

    for (let i = 0; i < navLinks.length; i++) {
        if (navLinks[i].id == id) {
            navLinks[i].classList.add("active") //Sfrutto la classe Bootstrap "active"
        }
    }
}