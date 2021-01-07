const axios = require('axios');

const User = require('../models/User');
const Cart = require('../models/Cart');

//Auth check accessing the whole app
let regex = /^\/za(\/.*)?$/;
let utilsRegex = /^\/util(\/.*)?$/;
const authenticate = async (req, res, next) => {
    let url = req.originalUrl;

    console.log(`Testing url: ${regex.test(url)}`);

    if(utilsRegex.test(url)) {
        return next();
    }

    if(!req.session.user && !regex.test(url)) {
        console.log('Recording the session user');
        console.log(req.session.user);
        console.log('Testing the url if its a /za');
        console.log(!regex.test(url));
        if(url === '/') {
            res.redirect('/za');
            return;
        }
        res.redirect('/za/login?forbidden');
        return;
    }

    if (req.session.user) {
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

//mpesa Access Token Generator
const mAccessTGen = async(req, res, next) => {
    var consumer_key = process.env.MPESA_CONSUMER_KEY,
    consumer_secret = process.env.MPESA_CONSUMER_SECRET_KEY,
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    auth = "Basic " + Buffer.from(consumer_key + ":" + consumer_secret).toString("base64");
  
    const response = await axios(
      {
        url,
        headers : {
          "Authorization" : auth
        }
      }
    );

    if(response.status >= 200 && response.status < 300) {
        req.accessT = response.data.access_token;
        console.log(response.data);
        next();
        return;
    }
    res.status(response.status).send();
}

//user's cart total calculator
const cartTotalPrice = async(req, res, next) => {
    try {
        const myProducts = await Cart.find({ owner: req.session.user });
        let total = 0;
        for( let myProduct of myProducts ) {
            const data = await myProduct.populate('productId').execPopulate();
            const productPrice = data.productId.price;
            const quantity = data.quantity;
            total += (productPrice * quantity);
        }
        req.cartTotalPrice = total;
        res.locals.cartTotalPrice = total;
        console.log('total');
        console.log(total);

        next();
    } catch (err) {
        console.log(err);
        res.status(500).render('errors/500');
    }
}

module.exports = {
    authenticate,
    mAccessTGen,
    cartTotalPrice
}