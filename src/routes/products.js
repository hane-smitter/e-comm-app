const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const router = express.Router();
const Product = require('../models/Product');
const Cart = require('../models/Cart');

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
router.get('/products', async (req, res) => {
    const products = await Product.find({}, null, {
        sort: {
            createdAt: -1 //DESC
        }
    }).lean();
    res.render('products', {products});
});
//serving up specific product image binaries
router.get('/za/product/image/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        const buffer = product.image;
        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
});

//more about a product
router.get('/product/:id', async (req, res) => {
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
});

//upload route
router.route('/upload')
/* upload page */
.get((req, res) => {
    res.render('upload');
})
/* upload */
.post(upload.single('product-image'),async (req, res) => {
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
    req.body.price = parseFloat(req.body.price).toFixed(2);
    req.body.validation();
    if(!req.file) {
        let err = 'You must provide an image of your product!'
        errors.push({err});
    }

    if(errors.length > 0) {
        return res.status(400).render('upload', {
            errors
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
            name: req.body.name,
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
}, (error, req, res, next) => {
    if(error) {
        console.log(error);
        //creating array to maintain consistency of displaying errors
        let errors = new Array();
        errors.unshift({err: error.message});
        return res.status(400).render('upload', {
            errors
        });
    }
});
//managing user's cart
//should be authenticated
router.get('/products/cart', async (req, res) => {
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
})
//create cart items of a user
router.post('/products/cart', async (req, res) => {
    try{
        const cartItems = req.body
        cartItems.owner = req.user;
        await new Cart(cartItems).save();
        res.send();
    } catch(err) {
        console.log(err);
        res.status(500).send();
    }
});
//update cart item
router.patch('/products/cart', async(req, res) => {
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
});
//remove cart item
router.delete('/products/cart', async(req, res) => {
    let productId = req.body.productId;
    try {
        let item = await Cart.findOne({productId});
        await item.remove();
        res.send();
    } catch(err) {
        console.log(err);
        res.status(500).send();
    }
});

//about
router.get('/about', (req, res) => {
    res.render('about');
});

//contact page
router.get('/contact', (req, res) => {
    res.render('contact');
});

module.exports = router;