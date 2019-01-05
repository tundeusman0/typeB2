const express = require('express')
const hbs = require('hbs')
const bodyParser = require('body-parser')
// const { mongoose } = require('./../db/mongoose');
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
hbs.registerHelper("contains", function (value, array, options) {
    array = (array instanceof Array) ? array : [array];
    return (array.indexOf(value) > -1) ? options.fn(this) : "";
});
hbs.registerHelper('ifCond',(v1, v2, options)=> {
    if (v1 === v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});


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