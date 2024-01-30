let isopen = true;
function menu_close_open(){
    if(isopen){
        document.querySelectorAll("#mco").forEach(function(value){value.style.display="none"});
        isopen=false;
    }else{
        document.querySelectorAll("#mco").forEach(function(value){value.style.display="block"});
        isopen=true
    }
}