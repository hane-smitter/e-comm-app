const User = require('../models/User');

let regex = /^\/za(\/.*)?$/;
let utilsRegex = /^\/util(\/.*)?$/;
const authenticate = async (req, res, next) => {
    let url = req.originalUrl;

    console.log(`Testing url: ${regex.test(url)}`);

    if(utilsRegex.test(url)) {
        return next();
    }

    if(!req.session.user && !regex.test(url)) {
        if(url === '/') {
            res.redirect('/za');
            return;
        }
        res.redirect('/za/login?forbidden');
        return;
    }

    if (req.session.user) {
        //To be used in views
        res.locals.user = req.session.user;
        console.log('res.locals.user');
        console.log(res.locals.user);
        console.log('req.session.user');
        console.log(req.session.user);
        try {
            const user = await User.findById(req.session.user);
            if(!user) {
                return res.redirect('/za/login?forbidden');
            }
            req.user = user;
            return next();

        } catch (err) {
            console.log(err);
            return res.render('errors/500');
        }
    }

    return next();
}

module.exports = {authenticate}