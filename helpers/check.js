const checkAuth = (user) => {
    const isAuthenticated = user !== undefined;
    if(!isAuthenticated) {
        return `
            <div class="container">
                <div class="row flex-end pt-3">
                    <a href="/za/login" class="btn btn-outline-light col-sm- mr-4 font-weight-bold">login</a>
                    <a href="/za/signup" class="btn btn-dark col-sm-">Sign Up</a>
                </div>
            </div>
        `;
    } else {
        return `
        <div class="container">
            <div class="row flex-end pt-3">
                <a href="/logout" class="btn btn-outline-light col-sm- mr-4 font-weight-bold">logout</a>
            </div>
        </div>
    `;
    }
}

module.exports = {
    checkAuth
}