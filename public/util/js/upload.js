const uploadForm = document.forms[0];
const priceInput = uploadForm['price'];
var error = true;

priceInput.oninput = () => {
    if(isNaN(priceInput.value)) {
        error = true;
        return priceInput.classList.add('input-warn');
    }
    if(+priceInput.value < 0) {
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