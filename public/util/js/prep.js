const txtInputs = document.querySelectorAll('input[type="text"]');
const mailInputs = document.querySelectorAll('input[type="email"]');

for(let i = 0; i < txtInputs.length; i++) {
    txtInputs[i].addEventListener('focus', prepTxtForm);
}

for(let i = 0; i < mailInputs.length; i++) {
    mailInputs[i].addEventListener('focus', prepMailForm, {once: true});
}

function prepTxtForm() {
    let form = this;
    console.log(form.value);
    form.selectionStart = 0;
    form.selectionEnd = form.value.length;
}
function prepMailForm() {
    let form = this;
    console.log(form.value);
    form.type = 'text';
    form.selectionStart = 0;
    form.selectionEnd = form.value.length;
    form.type = 'email';
}