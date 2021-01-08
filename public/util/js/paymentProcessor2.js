const socket = io();
socket.on('success', () => {
    window.location.href = '/success';
});
socket.on('cancel', (code) => {
    window.location.href = '/cancel?err=' + code;
});
let mpesaDiv = document.getElementsByClassName('mpesa')[0];
let phoneForm = document.getElementById('phone');
let phoneNumber = document.querySelector('#phone-number-input');
let mpesaOverlay = document.querySelector(".mpesa > div");
var sendPayRequestBtn = phoneForm.querySelector('button[type="submit"]');

mpesaDiv.onclick = function(e) {
    phoneForm.classList.remove('hide');
    mpesaOverlay.classList.add('overlay');
}
mpesaOverlay.addEventListener('click', function(event) {
    event.stopPropagation();
    if(event.target == event.currentTarget) {
        this.classList.remove('overlay');
        phoneForm.classList.add('hide');
    }
});

var xhr = new XMLHttpRequest();
var params;

phoneForm.addEventListener('submit', function(event) {
    event.preventDefault();

    sendPayRequestBtn.disabled = true;
    params = `phone=${phoneNumber.value}`;
    xhr.onload = function() {
        let receivedRes = JSON.parse(this.response);
        if(this.status >= 200 && this.status < 300) {
            console.log(receivedRes);
            console.log(this.status);
            //payment request sent
            sendPayRequestBtn.textContent = 'payment request sent';
            sendPayRequestBtn.classList.replace('btn-info', 'btn-success');
            sendPayRequestBtn.classList.add('text-white');
            return;
        }
        console.log(receivedRes);
        sendPayRequestBtn.innerHTML = `${receivedRes.stat}<br>Try again!`;
        sendPayRequestBtn.classList.add('text-danger');
        sendPayRequestBtn.disabled = false;
        console.error(receivedRes);
        console.error(this.status);
    }
    xhr.onerror = function () {
        console.error({
            error: this.response,
            code: this.status
        });
    }
    xhr.open('POST', '/lipa');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
});
