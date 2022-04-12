var socket = io();
//global
// by default user will join lounge
let room = "Lounge";
joinRoom("Lounge")
//socket.on('connect', () => {
////        socket.send('I\'m connected!');
//    });

socket.on('message',data => {

//        console.log(`message : ${data}`)
    console.log('client data')
    const p = document.createElement('p');
    const span_username = document.createElement('span');
    const br = document.createElement('br');
    const span_timestamp = document.createElement('span');
    console.log(data.msg)
    if (data.username == username){
//    Dispaly Messages
         p.setAttribute('class','my-msg');

//       username
         span_username.setAttribute('class','my-username');
         span_username.innerText = data.username;
//         time stamp
         span_timestamp.setAttribute('class','timestamp');
         span_timestamp.innerText = data.time_stamp




        p.innerHTML += span_username.outerHTML + br.outerHTML + data.msg + br.outerHTML + span_timestamp.outerHTML;
        document.getElementById('display-message-section').append(p)

    }
    else if
        (typeof data.username !== 'undefined'){
           p.setAttribute('class','others-msg');

//           usernames
          span_username.setAttribute('class','others-username')
          span_username.innerText = data.username;

//        time_stamp

          span_timestamp.setAttribute('class','timestamp');
          span_timestamp.innerText =  data.time_stamp;

          p.innerHTML += span_username.outerHTML + br.outerHTML + data.msg + br.outerHTML + span_timestamp.outerHTML;
          document.getElementById('display-message-section').append(p)


        }



    else {
        printSysMsg(data.msg)
    }
    scrollDownChatWindow();

});


document.getElementById('send_message').onclick = () =>{
    console.log('data ready!')
//    send data to the server
    socket.send({'msg':document.getElementById('user_message').value,'username':username,'room':room});
//    clear input area
    document.getElementById('user_message').value = '';

}
// Room selection
document.querySelectorAll('.select-room').forEach(p => {
    p.onclick = () => {
        console.log('clicked')
        let newroom = p.innerHTML;
//        room -> current room
        if (newroom == room){
            msg = `You are already inside ${room} room `
            printSysMsg(msg);
        }
        else {

            leaveRoom(room)
            joinRoom(newroom)
//            user joined new room update that to newroom
            room = newroom


        }
    }
})

document.getElementById('logout-btn').onclick = () => {
 leaveRoom(room)
}

function leaveRoom(room){
//emits to server
    socket.emit('leave',{'username':username,'room':room})

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
    p.innerHTML = msg;
    document.getElementById('display-message-section').append(p);
    scrollDownChatWindow();
}