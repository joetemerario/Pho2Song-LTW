
function getSong(){
    let listItems= $('#songsList').children()
    for (let id = 0; id < listItems.length; id++) {
        let flag=true
        $.ajax({url:"/getSong",type:"GET",cache:false, success: function(response,status) {
            $("#spin"+id).hide()
            /* response = {
                uri: <uri-della-canzone>
                name: <nome-della-canzone>
            } */
            /* genero l'iframe */
            let embed = 'https://open.spotify.com/embed?uri=' +encodeURIComponent(response.uri)
            let string='<div class="col-11 px-0"><iframe style="border-radius:12px" src="'+embed+ '" allowtransparency="true" width="280" height="80" frameBorder="0" allow="encrypted-media;"></iframe></div>'//<div class="ratio" style="--bs-aspect-ratio: 20%;"></div>';
            
            $("#text"+id).text(response.name)/* nome della canzone inserito in sovraimpressione alla foto dalla cui è stata scelta */
            
            $("#"+id).append(string);/* inserisco l'iframe */
            if(response.uri=== undefined){
                $("#text"+id).text("Non abbiamo potuto analizzare questa foto :(")
                $("#li"+id).remove()
                flag=false
            }
            else{
                $("#check"+id).val(response.uri)/* uri come valore dell'input checkbox i-esimo */
                $("#"+id).show();
            }
            
        }});
        if(flag){
            $("#spin"+id).show()
            $("#li"+id).show()
        }
    }
    $("#carouselExampleControls").show()
    $("#submit").show()
}


function checkAll(){
    
    var checkboxes = document.getElementsByName('songs')/* tutti gli input checkbox */
    for (let index = 0; index < checkboxes.length; index++){
        checkboxes[index].checked=true
    }
    document.getElementById('submitmodal').disabled=false;/*tasto 'salva questa playlist' */
}
function checkValid(id){
    if(document.getElementById(id).checked){
        document.getElementById('submitmodal').disabled=false;
    }
    else{
        var checkboxes = document.getElementsByName('songs')
        for (let index = 0; index < checkboxes.length; index++){
            if(checkboxes[index].checked){
                return;
            }
        }
        document.getElementById('submitmodal').disabled=true;
    }
}