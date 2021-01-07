const express = require('express');
const router = express.Router();
const passport = require('passport');
const {onlyGuest} = require('../middleware/onlyguest');
const {home, login, loginHandler, register, registerHandler} = require('../controllers/basic');

//home route
router.get(['/','/index', '/za', '/za/index'], home);

//sign up route
router.route('/za/signup')
.get(onlyGuest, register)
.post(onlyGuest, registerHandler);

//login route
router.route('/za/login')
.get(onlyGuest, login)
.post(onlyGuest, loginHandler);


/* Foreign party login
//google log in
*/
router.get('/za/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));
router.get('/za/auth/google/cb', passport.authenticate('google', {
    failureRedirect: '/za/login',
    failureMessage: 'login failed!!'
}), (req, res) => {
    req.session.user = req.user._id;
    res.redirect('/');
});


//logout route
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/za');
    });
});

//Not found
router.route('/*')
.get((req, res) => {
    res.render('errors/404', { layout: 'error' });
})
.post((req, res) => {
    res.render('errors/404', { layout: 'error' });
});


module.exports = router;