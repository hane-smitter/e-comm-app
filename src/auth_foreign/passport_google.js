const GoogleStategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function (passport) {
    passport.use(
        new GoogleStategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/za/auth/google/cb'
        }, async (accessToken, refreshToken, profile, done) => {
            try{
                const user = await User.findOrCreate(profile);
                done(null, user);
            }catch(e) {
                console.log(e);
                done(e);
            }
        })
        
    );
    //done called frm above code means whole user is passed to serializeUser
    //serializeUser and deserializeUser are responsible for attaching req.user
    //req.session.passport happens here
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    //req.user is attached here
    passport.deserializeUser(async function(id, done) {
       const user = await User.findById(id);
        done(null, user);
    });
}