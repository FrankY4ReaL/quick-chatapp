// Initialize client side socket
var socket = io();

// by default user will join lounge
let room = "Lounge";
joinRoom("Lounge")

socket.on('message',data => {
  // When Client receives message from the server
    const p = document.createElement('p');
    const span_username = document.createElement('span');
    const br = document.createElement('br');
    const span_timestamp = document.createElement('span');

    if (data.username == username){

         p.setAttribute('class','my-msg');

// Username
         span_username.setAttribute('class','my-username');
         span_username.innerText = data.username;
//  Timestamp
         span_timestamp.setAttribute('class','timestamp');
         span_timestamp.innerText = data.time_stamp

         p.innerHTML += span_username.outerHTML + br.outerHTML + data.msg + br.outerHTML + span_timestamp.outerHTML;
         document.getElementById('display-message-section').append(p)

    }
    else if
        (typeof data.username !== 'undefined'){
           p.setAttribute('class','others-msg');

//  Usename
          span_username.setAttribute('class','others-username')
          span_username.innerText = data.username;

//  Timestamp

          span_timestamp.setAttribute('class','timestamp');
          span_timestamp.innerText =  data.time_stamp;

          p.innerHTML += span_username.outerHTML + br.outerHTML + data.msg + br.outerHTML + span_timestamp.outerHTML;
          document.getElementById('display-message-section').append(p)


        }

    else {
        printSysMsg(data.msg)
    }
    // scrolls window down auto
    scrollDownChatWindow();

});


document.getElementById('send_message').onclick = () =>{

//    send data to the server
    socket.emit('incoming-message',{'msg':document.getElementById('user_message').value,'username':username,
    'room':room});
//    clear input area
    document.getElementById('user_message').value = '';

}
// Room selection
document.querySelectorAll('.select-room').forEach(p => {
    p.onclick = () => {

        let newroom = p.innerHTML;
//        room -> current room
        if (newroom == room){
            msg = `You are already inside ${room} room `
            printSysMsg(msg);
        }
        else {

            leaveRoom(room)
            joinRoom(newroom)
//           user joined new room update that to newroom
            room = newroom
        }
    }
});

// When user clicks logout send request to server
document.getElementById('logout-btn').onclick = () => {
 leaveRoom(room)
}

function leaveRoom(room){
//emits to server
    socket.emit('leave',{'username':username,'room':room})
     document.querySelectorAll('.select-room').forEach(p => {
            p.style.color = "black";
        });

}

function joinRoom(room){
// emits to server
    socket.emit('join',{'username':username,'room':room})

//   // Highlight selected room
    document.querySelector('#' + CSS.escape(room)).style.color = "#ffc107";
    document.querySelector('#' + CSS.escape(room)).style.backgroundColor = "white";
//    when user joins new room clear previous message area
    document.getElementById('display-message-section').innerHTML = ''
    document.getElementById('user_message').focus();
}

function scrollDownChatWindow(){
    const chatWindow = document.getElementById('display-message-section');
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function printSysMsg(msg){
    const p = document.createElement('p');
    p.setAttribute('class','system-msg');
    const br = document.createElement('br');
    p.innerHTML = br.outerHTML + msg;
    document.getElementById('display-message-section').append(p);
    scrollDownChatWindow();
}
