
function getSong(){
    let listItems= $('#songsList').children()
    for (let id = 0; id < listItems.length; id++) {
        $.ajax({url:"/getSong",type:"GET",cache:false, success: function(response,status) {
            $("#spin"+id).hide()
            let embed = 'https://open.spotify.com/embed?uri=' +encodeURIComponent(response.uri)
            let string='<div class="col-11 px-0"><iframe style="border-radius:12px" src="'+embed+ '" allowtransparency="true" width="280" height="80" frameBorder="0" allow="encrypted-media;"></iframe></div>'//<div class="ratio" style="--bs-aspect-ratio: 20%;"></div>';
            
            $("#text"+id).text(response.name)
            
            $("#"+id).append(string);
            $("#check"+id).val(response.uri)
            $("#"+id).show();
        }});
        $("#spin"+id).show()
        $("#li"+id).show()
    }
    $("#carouselExampleControls").show()
    $("#submit").show()
}


function checkAll(){
    
    var checkboxes = document.getElementsByName('songs')
    for (let index = 0; index < checkboxes.length; index++){
        checkboxes[index].checked=true
    }
    document.getElementById('submitmodal').disabled=false;
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