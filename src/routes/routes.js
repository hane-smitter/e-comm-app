const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const Product = require('../models/Product');
const {onlyGuest} = require('../middleware/onlyguest');

//home route
router.get('', async (req, res) => {
    try {
        const products = await Product.find({}, null, {
            skip: 0,
            limit: 10,
            sort: {
                createdAt: -1
            }
        }).lean();
        res.render('index', {products});
    } catch (err) {
        console.log(err);
        res.status(400).render('errors/404');
    }
    
});
router.get('/index', async (req, res) => {
    try {
        const products = await Product.find({}, null, {
            skip: 0,
            limit: 10,
            sort: {
                createdAt: -1
            }
        }).lean();
        res.render('index', {products});
    } catch (err) {
        console.log(err);
        res.status(400).render('errors/404');
    }
});
router.get('/za', async (req, res) => {
    try {
        const products = await Product.find({}, null, {
            skip: 0,
            limit: 10,
            sort: {
                createdAt: -1
            }
        }).lean();
        res.render('index', {products});
    } catch (err) {
        console.log(err);
        res.status(400).render('errors/404');
    }
});
router.get('/za/index', async (req, res) => {
    try {
        const products = await Product.find({}, null, {
            skip: 0,
            limit: 10,
            sort: {
                createdAt: -1
            }
        }).lean();
        res.render('index', {products});
    } catch (err) {
        console.log(err);
        res.status(400).render('errors/404');
    }
});

//sign up route
router.route('/za/signup')
.get(onlyGuest, (req, res) => {
    res.render('signup', { layout: 'form' });
})
.post(onlyGuest, async (req, res) => {
    console.log(req.body);
    try {
        const errors = new Array();
        const required = ['firstName', 'lastName', 'email', 'password'];
        const dulyFilled = required.every(val => req.body[val].length > 0);
        if(!dulyFilled) {
            errors.push({val: 'Please entirely fill in your details!'});
            return res.status(400).render('signup', {
                layout: 'form',
                message: {
                    errors,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email
                    }
                })
        }

        const existingUser = await User.findExisting(req.body.email);
        if(existingUser) {
            errors.push({val: 'Email is taken!'});
        }
        if(req.body.password !== req.body.confirmpass) {
            errors.push({val: 'passwords do not match'});
        }
        if(errors.length > 0) {
            return res.status(400).render('signup', {
                layout: 'form',
                message: {
                    errors,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email
                 }
             })
        }
        const user = await new User(req.body);
        await user.save();
        req.user = user;
        req.session.user = req.user._id;
        res.redirect('/');
    } catch (err) {
        console.log(err);
        res.status(400).render('errors/500');
        
    }
});

//login route
router.route('/za/login')
.get(onlyGuest, (req, res) => {
    res.render('login', { layout: 'form' });
})
.post(onlyGuest, async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        req.user = user;
        console.log(req.user);
        req.session.user = req.user._id;

        res.redirect('/za');
    } catch (err) {
        console.log(err);
        res.status(400).render('login', {
            layout: 'form',
            message: {
            error: 'login failed!',
            email: req.body.email
            } 
        });
    }

});


/* Third party login
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
    res.redirect('/za');
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