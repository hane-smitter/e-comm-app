const express = require('express');
const multer = require('multer');
const router = express.Router();

//middleware
const{ mAccessTGen, cartTotalPrice } = require('../middleware/auth');

const {
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
} = require('../controllers/detail');

const upload = multer({
    limits: {
        fileSize: 2000000/* 2MB */
    },
    fileFilter(req, file, cb){
        if(!/\.jpe?g|\.png$/.test(file.originalname)) {
            return cb(new Error('Only (jpg, jpeg, png) images are allowed!'));
        }
        cb(undefined, true);
    }
});

//list all products
router.get('/products', allProducts);
//serving up specific product image binaries
router.get('/util/product/image/:id', imageBin);

//a product detail information
router.get('/product/:id', productInfo);

//upload route
router.route('/upload')
/* upload page */
.get( productUpload )
/* upload */
.post( upload.single('product-image'), productUploadHandler, productUploadErrorHandler );

//managing user's cart
//should be authenticated
router.route('/products/cart')
    .get( fetchCart )
    //create cart items of a user
    .post( createCartItem )
    //update cart item
    .patch( updateCartItem )
    //remove cart item
    .delete( deleteCartItem );

//payment checkout
router.route('/checkout')
.get(cartTotalPrice, paymentCheckout)
.post(cartTotalPrice, purchase);

//MPESA c2b checkout
router.route('/buy')
.get((req, res) => {
    res.render('mcheckout', { layout: false });
})
.post(mAccessTGen, mpesac2b);

//MPESA Lipa Na Mpesa Online
router.post('/lipa', mAccessTGen, cartTotalPrice, mpesaLipaOnline);

router.post('/c2b/confirmation',(req, res) => {
	console.log('-----------C2B CONFIRMATION REQUEST------------');
	console.log(req.body);
	console.log('-----------------------');

	let message = {
		"ResultCode": 0,
		"ResultDesc": "Success"
	};


	res.json(message);
});

router.post('/c2b/validation', (req, res) => {
	console.log('-----------C2B VALIDATION REQUEST-----------');
	console.log(req.body);
	console.log('-----------------------');

	let message = {
		"ResultCode": 0,
		"ResultDesc": "Success",
		"ThirdPartyTransID": "1234567890"
	};

	res.json(message);
});

//payment success page
router.get('/success', paymentSuccess);

//payment cancel page
router.get('/cancel', paymentCancel);

//lipa na mpesa  callbackurl
router.post('/za/mresponse', mpesaCallback);

//about
router.get('/about', about );

//contact page
router.get('/contact', contact );

module.exports = router;