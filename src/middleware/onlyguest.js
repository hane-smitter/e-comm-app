const onlyGuest = (req, res, next) => {
    if(req.user) {
        return res.redirect('/za');
    }
    next();
}

module.exports = {
    onlyGuest
}