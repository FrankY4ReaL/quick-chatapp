//When user hits enter submit the message
console.log('this is loaded')
let msg = document.getElementById('user_message');
msg.addEventListener('keyup',event => {

    event.preventDefault();
    if (event.keyCode === 13){
        document.getElementById('send_message').click();
    }

})

document.getElementById('user_message').focus();

// show sidebar on click
document.getElementById('show-sidebar-button').onclick = () => {
    document.getElementById('sidebar').classList.toggle('view-sidebar')
}