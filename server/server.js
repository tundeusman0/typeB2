const express = require('express')
const hbs = require('hbs')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash');


const pages  = require('./../routes/pages')
const admin_pages = require('./../routes/admin_pages')
// path 
const path = require('path')

// path for partials and public
const publicPath = path.join(__dirname, '/../public')
const partialsPath = path.join(__dirname,'/../views/partials')

// register partials
hbs.registerPartials(partialsPath)


const app = express();
// body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// express session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

app.use(flash());
app.use(function (req, res, next) {
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;
    next();
});

// app.use(expressValidator());
// expressValidator

// express messages
// app.use(require('connect-flash')());
// app.use(function (req, res, next) {
//     res.locals.messages = require('express-messages')(req, res);
//     next();
// });

// set view engine
app.set('view engine','hbs')
// set static path
app.use(express.static(publicPath))

// app.locals.errors = null

app.use('/admin', admin_pages)
app.use('/',pages)

app.listen(8000,()=>{
    console.log('server is on')
})