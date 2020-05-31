document.addEventListener("dragstart", function (event){

    event.dataTransfer.setData("element", event.target.id)
    event.target.style.opacity = "0.4";
})

document.addEventListener("dragend", function (event){
    event.target.style.opacity = "1";

})

document.addEventListener("dragenter", function(event) {
    if ( event.target.id == "middle" ) {

    }
});

document.addEventListener("dragover", function(event) {
    event.preventDefault();
  });


document.addEventListener("dragleave", function(event) {

});

document.addEventListener("drop", function(event) {
    event.preventDefault();
    if ( event.target.id == "middle" ) {
        var data = event.dataTransfer.getData("element");
        event.target.appendChild(document.getElementById(data));
        document.getElementById("wldrop"+data.substring(2, data.length)).style.display = "block"
}
});
