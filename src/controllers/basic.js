const User = require('../models/User');
const Product = require('../models/Product');

const home = async (req, res) => {
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
    
}
const login = (req, res) => {
    res.render('login', { layout: false });
}
const loginHandler = async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        req.user = user;
        console.log(req.user);
        req.session.user = user._id;

        res.redirect('/');
    } catch (err) {
        console.log(err);
        res.status(400).render('login', {
            layout: false,
            message: {
            error: 'login failed!',
            email: req.body.email
            } 
        });
    }

}
const register = (req, res) => {
    res.render('signup', { layout: false });
}
const registerHandler = async (req, res) => {
    console.log(req.body);
    try {
        const errors = new Array();
        const required = ['firstName', 'lastName', 'email', 'password'];
        const dulyFilled = required.every(val => req.body[val].length > 0);
        if(!dulyFilled) {
            errors.push({val: 'Please entirely fill in your details!'});
            return res.status(400).render('signup', {
                layout: false,
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
                layout: false,
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
}

module.exports = {
    home,
    login,
    loginHandler,
    registerHandler,
    register
}