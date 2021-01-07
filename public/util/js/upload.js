let inpValue;
const uploadForm = document.forms[0];
const priceInput = uploadForm['price'];
const uploadFeedCloseBtn = document.getElementsByClassName('close-feed')[0];
var error = true;

window.addEventListener('load', () => {
    inpValue = priceInput.value;
    if(isNaN(inpValue)) {
        error = true;
        return priceInput.classList.add('input-warn');
    }
    error = false;

    uploadFeedCloseBtn.onclick = () => {
        document.querySelector('div.upload-feed').remove();
    }
})

priceInput.oninput = () => {
    console.log(inpValue);
    inpValue = priceInput.value;
    if(isNaN(inpValue)) {
        error = true;
        return priceInput.classList.add('input-warn');
    }
    if(+inpValue < 0) {
        priceInput.value = 0;
    }
    error = false;
    priceInput.classList.remove('input-warn');
}

function controlSubmit() {
    if(error) {
        alert('You have entered wrong details!');
        return false;
    }else {
        return true;
    }
}