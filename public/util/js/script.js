var signupForm = document.querySelector('.sign-up');
var pass = document.getElementById('pass');
var confirmPass = document.getElementById('confirmpass');
var checkBoxBtn = signupForm.querySelector('.remember input[type="checkbox"]');
var signUpBtn = signupForm.querySelector('button[type="submit"]');

btnTermsCheck();
checkBoxBtn.addEventListener('change', btnTermsCheck);


function checkPass() {
    if(pass.value === confirmPass.value) {
        return true;
    }
    alert('passwords do not match!');
    return false;
}

function btnTermsCheck() {
    if(!checkBoxBtn.checked) {
        signUpBtn.disabled = true;
    } else {
        signUpBtn.disabled = false;
    }
}