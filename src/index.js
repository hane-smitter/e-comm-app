const path = require('path');
require('./db/mongoose');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const express_enforces_ssl = require('express-enforces-ssl');

const {authenticate} = require('./middleware/auth');
const products = require('./routes/products');
const routes = require('./routes/routes');
const {checkAuth, trimPrice} = require('../helpers/check');
const passport = require('passport');

const app = express();
const port = process.env.PORT;

//set browser cross origin
app.use(cors());

if(process.env.NODE_ENV == 'development') {
    //logger
    app.use(morgan('dev'));
} else{
    //enforce secure connection
    app.enable('trust proxy');
    app.use(express_enforces_ssl());
}

//configure sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

//parse request body
app.use(express.urlencoded({ extended: true }));

//method override 
app.use(methodOverride( function(req, res) {
    if(req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
} ));

//use a static folder
const publicDir = path.join(__dirname, '../public/util');
app.use(express.static(publicDir));

//configure view engine
app.engine('.html', exphbs({defaultLayout: 'main', extname: '.html', helpers: {
    checkAuth,
    trimPrice
}}));
app.set('view engine', '.html');

//protect routes
app.use( async function (req, res, next) {

    return authenticate(req, res, next);
    
});

//Third party logins
/* google auth */
require('./auth_foreign/passport_google')(passport);
app.use(passport.initialize());
app.use(passport.session());


//route handlers
app.use(products);
app.use(routes);



app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
});