const checkAuth = (user = false) => {
    const isAuthenticated = user !== false;
    if(!isAuthenticated) {
        return `<div class="container">
                <div class="row flex-end pt-3">
                    <a href="/za/login" class="btn btn-outline-light col-sm- mr-4 font-weight-bold">login</a>
                    <a href="/za/signup" class="btn btn-dark col-sm-">Sign Up</a>
                </div>
            </div>`;
    } else {
        return `<div class="container">
            <div class="row flex-end pt-3">
                <a href="/logout" class="btn btn-outline-light col-sm- mr-4 font-weight-bold">logout</a>
            </div>
        </div>`;
    }
}

const trimPrice = (price) => {
    const num = parseFloat(price).toFixed(2);
    const number = parseFloat(num).toLocaleString('en-us');
    return number;
};

module.exports = {
    checkAuth,
    trimPrice
}