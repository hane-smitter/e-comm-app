const sharp = require('sharp');
const stripe = require('stripe')(process.env.STRIPE_PRIV_KEY);
const Mpesa = require('mpesa-node');
const axios = require('axios');

const mpesaApi = new Mpesa({
    consumerKey: 'xqu9Uinhu1yx9XbCwph5QfM7pLakP7b2',
    consumerSecret: '	AWRKk6DB9b2Z1mU4',
    environment: 'sandbox',
    shortCode: '600111',
    initiatorName: 'Test Initiator',
    lipaNaMpesaShortCode: 174379,
    lipaNaMpesaShortPass: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
});

const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Payment = require('../models/Payment');

//list all products
const allProducts = async (req, res) => {
    const products = await Product.find({}, null, {
        sort: {
            createdAt: -1 //DESC
        }
    }).lean();
    res.render('products', {products});
}

//serve image binaries
const imageBin = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        const buffer = product.image;
        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
}

//view details of single product
const productInfo = async (req, res) => {
    try {
        const product = await Product
        .findById(req.params.id)
        .lean();
        //featured products section data
        const DBproducts = await Product.find({}, null, {
            skip: 0,
            limit: 6,
            sort: {
                createdAt: -1
            }
        })
        .lean();
        //filtering out current displayed product
        let products = DBproducts.filter((prod) => prod._id.toString() !== product._id.toString());
        res.render('product-desc', { product, products });
    } catch (err) {
        console.log(err);
        res.render('errors/404', {layout: 'error'});
    }
}

//upload a product
const productUpload = (req, res) => {
    res.render('upload', {layout: false});
}
//handle the product upload logic
const productUploadHandler = async (req, res) => {
    console.log(req.body);
    var errors = new Array();
    req.body.validation = function() {
        if(this.name.length < 1) {
            let err = 'Provide the name of your product!';
            errors.push({err});
        }else if(this.name.length > 35) {
            let err = 'Product name should be less than 36 characters long!';
            errors.push({err});
        }
        if(typeof +this.price !== 'number' || isNaN(this.price)) {
            let err = 'Price should be in numbers!';
            errors.push({err});
        }
    }

    //validate the client data
    req.body.price = Math.round(parseFloat(req.body.price)).toFixed(2);
    req.body.validation();
    var nameExists = await Product.findOne({ name: req.body.name.toLowerCase() });
    console.log('nameExists');
    console.log(nameExists);
    if (nameExists) {
        errors.push({err: 'This name has been taken'});
    }
    if(!req.file) {
        let err = 'You must provide an image of your product!';
        errors.push({err});
    }

    let values = Object.assign({}, req.body);
    console.log(req.file);

    if(errors.length > 0) {
        return res.status(400).render('upload', {
            errors,
            layout: false,
            values
        });
    }

    //save data
    try {
        //resize the image
        const buffer = await sharp(req.file.buffer).resize({
            width: 200,
            height: 200
        }).png().toBuffer();

        let product = {
            name: req.body.name.toLowerCase(),
            price: req.body.price,
            description: req.body.description,
            image: buffer,
            owner: req.user._id
        };


        await new Product(product).save();
        res.render('upload', {
            success: 'created successfully!'
        });
    } catch (err) {
        console.log(err);
        res.render('errors/500');
    }
}
const productUploadErrorHandler = (error, req, res, next) => {
    if(error) {
        console.log(error);
        //creating array to maintain consistency of displaying errors
        let errors = new Array();
        errors.unshift({err: error.message});
        let values = Object.assign({}, req.body);
        return res.status(400).render('upload', {
            errors,
            layout: false,
            values
        });
    }
}

//Get cart items of a user
const fetchCart = async (req, res) => {
    try {
        const cartItems = await Cart.find({owner: req.user}).lean();
        if(cartItems.length < 1) {
            return res.status(404).send();
        }
        var prodItems = new Array();

        for (let cartItem of cartItems) {
            var product = await Product.findById(cartItem.productId).lean();
            product.quantity = cartItem.quantity;
            delete product.description;
            delete product.createdAt;
            delete product.updatedAt;
            delete product.image;
            prodItems.unshift(product);
        }
        res.send(prodItems);
    } catch (err) {
        console.log(err);
        res.status(400).send();
    }
}
//create cart entry of a user
const createCartItem = async (req, res) => {
    try{
        const cartItems = req.body
        cartItems.owner = req.user;
        await new Cart(cartItems).save();
        res.send();
    } catch(err) {
        console.log(err);
        res.status(500).send();
    }
}
//update a user's cart item
const updateCartItem = async(req, res) => {
    try {
        let {quantity, productId} = req.body;
        const cartItems = await Cart.findOne({productId});
        if(!cartItems) {
            return res.status(404).send();
        }
        cartItems.quantity = parseInt(quantity);
        await cartItems.save();
        res.send();
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
}
//delete a user's cart item
const deleteCartItem = async(req, res) => {
    let productId = req.body.productId;
    try {
        let item = await Cart.findOne({productId});
        await item.remove();
        res.send();
    } catch(err) {
        console.log(err);
        res.status(500).send();
    }
}

//payment checkout
const paymentCheckout = (req, res) => {
    var io = req.app.locals.io;
    io.on('connection', (socket) => {
        console.log('web socket connection established!!');

        let paid = () => {
            socket.emit('success');
        }
        let cancel = (code) => {
            socket.emit('cancel', code);
        }

        req.app.locals.paid = paid;
        req.app.locals.cancel = cancel;
    })
    res.render('checkout', { layout: false });
}

//stripe purchase
const purchase = async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
              {
                price_data: {
                  currency: 'kes',
                  product_data: {
                    name: 'Mmusify',
                    images: ['https://mmusify.herokuapp.com/images/img3.jpg'],
                  },
                  unit_amount: req.cartTotalPrice * 100,
                },
                quantity: 1,
              },
            ],
            mode: 'payment',
            success_url: `http://localhost:3000/success`,
            cancel_url: `http://localhost:3000/cancel`,
          });
          res.json({ id: session.id });
    } catch (err) {
        res.status(400).send(err.message);
        console.log(err);
    }
}

//MPESA c2b
const mpesac2b = async(req, res) => {

    let url = 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl';
    let auth = 'Bearer ' + req.accessT;

    let json = {
        "ShortCode": "600383",
        "ResponseType": "Done",
        "ConfirmationURL": "https://mmusify.herokuapp.com/c2b/confirmation",
        "ValidationURL": "https://mmusify.herokuapp.com/c2b/validation"
      }

      try {
        const result = await axios.post(url, json, {
            headers: {
                "Authorization" : auth,
                // Overwrite Axios's automatically set Content-Type
                'Content-Type': 'application/json'
            }
        });

        console.log(result.data);
      } catch (err) {
          console.log(err.message);
          res.end();
      }
    
}

//MPESA Lipa now online
const mpesaLipaOnline = async(req, res) => {
    console.log(req.body);

    let url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    let auth = "Bearer " + req.accessT;
    let bizShortCode = 174379;

    function formatDate(date) {
        var d = new Date(date),
            seconds = '' + (d.getSeconds()),
            minutes = '' + (d.getMinutes()),
            hours = '' + (d.getHours()),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (seconds.length < 2) 
            seconds = '0' + seconds;
        if (minutes.length < 2) 
            minutes = '0' + minutes;
        if (hours.length < 2) 
            hours = '0' + hours;
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day, hours, minutes, seconds].join('');
    }

    function genPwd(bussinessShortCode, passKey = process.env.LIPA_NA_MPESA_ONLINE_PASSKEY, timestamp) {
        const securityKey = Buffer.from(bussinessShortCode + passKey + timestamp).toString("base64");
        return securityKey;
    }    

    console.log(`CART TOTAL PRICE`);
    console.log(`${req.cartTotalPrice}`);
    var currentTime = formatDate(Date.now());
    let json = {
        "BusinessShortCode": bizShortCode,
        "Password": genPwd(bizShortCode, undefined, currentTime),
        "Timestamp": currentTime,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": `${req.cartTotalPrice}`,
        "PartyA": `254${req.body.phone}`,
        "PartyB": bizShortCode,
        "PhoneNumber": `254${req.body.phone}`,
        "CallBackURL": `${process.env.LIPA_NA_MPESA_CB_URL}`,
       "AccountReference": "Mmusify Online Shop",
        "TransactionDesc": "Pay Now"
      }

      try {
        const result = await axios.post(url, json, {
            headers: {
                "Authorization": auth,
                "Content-Type" : "application/json"
            }
        });

        //Storing the record results in DB
        let store = {
            payer_id: result.data.CheckoutRequestID,
            user_id: req.session.user
        }
        const persist = await new Payment(store);
        await persist.save();

        //response code should be '0' to show successful transaction from safaricom's servers
        if(result.data.ResponseCode === '0') {
            return res.json({ stat: result.data.ResponseDescription });
        }
        res.status(300).send({ stat: result.data.ResponseDescription });
      } catch (err) {
        console.log(err);
        res.status(500).send({ stat: 'oops! Server error.' });
      }
    
}

//mpesa stk callback url
const mpesaCallback = async (req, res) => {

    console.log('safaricom callback confirmation url');
    console.log(req.body.Body.stkCallback);
    console.log(req.body.Body.stkCallback.ResultDesc);
    let reqBody = req.body.Body.stkCallback;
    var payer_id = reqBody.CheckoutRequestID;
    var reason = req.body.Body.stkCallback.ResultDesc;
    var hasPaid = parseInt(reqBody.ResultCode) === 0;
    var failMsg = {
        "ResponseCode": "1",
        "ResponseDesc": "cancelled"
    };
    var successMsg = {
        "ResponseCode": "00000000",
        "ResponseDesc": "success"
    };

    try {
        if(hasPaid) {
            const customer = await Payment.findOne({payer_id});    
            if(!customer) {
                throw new Error('This checkout request id has not been found!');
            }
            let resArr = reqBody.CallbackMetadata.Item;
    
            const clearedCustomer = {
                status: 'paid',
                amount: resArr[0].Value,
                mpesa_receipt: resArr[1].Value,
                mpesa_date: resArr[3].Value,
                phone_number: resArr[4].Value
            }
            Object.assign(customer, clearedCustomer);
            await customer.save();
            //ws for successful payment
            req.app.locals.success();
            res.json(successMsg);
        }
        else {
            throw new Error(reqBody.ResultCode);
        }
    } catch (err) {
        await Payment.findOneAndDelete({payer_id});
        //ws for failed payment
        req.app.locals.cancel(err.message);
        res.json(failMsg);
    }
}

//stripe successful payment
const paymentSuccess = (req, res) => {
    res.render('paymentSuccess', { layout: 'paysuccess' });
}

//stripe unsuccessful payment
const paymentCancel = (req, res) => {
    let errCode = req.query.err;
    console.log('errCode');
    console.log(errCode);
    let msg = 'not set';
    switch (errCode) {
        case 1:
            msg = 'Insufficient Funds'
            break;
        case 2:
            msg = 'Less Than Minimum Transaction Value'
            break;
        case 3:
            msg = 'More Than Maximum Transaction Value'
            break;
        case 4:
            msg = 'Would Exceed Daily Transfer Limit'
            break;
        case 5:
            msg = 'Would Exceed Minimum Balance'
            break;
        case 6:
            msg = 'Unresolved Primary Party'
            break;
        case 7:
            msg = 'Unresolved Receiver Party'
            break;
        case 8:
            msg = 'Would Exceed Maxiumum Balance'
            break;
        case 11:
            msg = 'Debit Account Invalid'
            break;
        case 12:
            msg = 'Credit Account Invalid'
            break;
        case 13:
            msg = 'Unresolved Debit Account'
            break;
        case 14:
            msg = 'Unresolved Credit Account'
            break;
        case 15:
            msg = 'Duplicate Detected'
            break;
        case 17:
            msg = 'Mpesa Internal Failure'
            break;
        case 20:
            msg = 'Unresolved Initiator'
            break;
        case 26:
            msg = '	Traffic blocking condition in place'
            break;
    
        default:
            break;
    }
    console.log('payment cancel');
    console.log(msg);

    res.render('paymentCancel', { layout: 'payfail', msg });
}

//about
const about = (req, res) => {
    res.render('about');
}

//contact
const contact = (req, res) => {
    res.render('contact');
}

module.exports = {
    allProducts,
    imageBin,
    productInfo,
    productUpload,
    productUploadHandler,
    productUploadErrorHandler,
    fetchCart,
    createCartItem,
    updateCartItem,
    deleteCartItem,
    about,
    contact,
    paymentCheckout,
    purchase,
    paymentSuccess,
    paymentCancel,
    mpesac2b,
    mpesaLipaOnline,
    mpesaCallback
}