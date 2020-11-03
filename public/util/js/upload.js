const uploadForm = document.forms[0];
const priceInput = uploadForm['price'];

priceInput.oninput = () => {
    if(priceInput.value < 0) {
        priceInput.value = 0;
    }
}