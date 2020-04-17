function showToast(msg) {
    console.log("El mensaje es: ", msg);
    $.toast({
        text: msg,
        position: "top-right"
    })
}

window.socket = null;
function connectToSocketio() {
    let server = window.location.protocol + "//" + window.location.host;
    window.socket = io.connect(server);

    window.socket.on('toast', function(data){
        showToast(data.message);
    })
    window.socket.on('gameStart',function(data){
        document.getElementById('wait-to-start').style.display = "none";
        console.log(data.letter);
        document.getElementById('letter').innerHTML = "La letra es: "+data.letter;
        document.getElementById('game-form').style.display = "block";

        //document.getElementById()
    })
    window.socket.on('timeout', function(data){

        showToast(data.time);
    })
    //var clients = io.clients();
    //showToast(clients);
    window.socket.on('end-game', function(data){
        name = document.getElementById('name').value;
        character = document.getElementById('character').value;
        weapon = document.getElementById('weapon').value;
        window.socket.emit('answer',{name: name, character: character, weapon: weapon} )
        document.getElementById('game-form').style.display = "none";

        showToast("GameEnded");
    })

    
}

function playerReady(){
    window.socket.emit('player-ready');
    document.getElementById('unready').style.display = "none";
    document.getElementById('wait-to-start').style.display = "block";
}
function sendAnswers(){
    
    window.socket.emit('stop-game')
    window.socket.emit('message-to-server',{message: "Ending Game"})
}
function messageToServer(msg) {
    window.socket.emit('message-to-server', {message: msg});
}

$(function () {
    connectToSocketio();
})