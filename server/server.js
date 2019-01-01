const express = require('express')
const hbs = require('hbs')
const {mongoose} = require('./../db/mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const { check, validationResult } = require('express-validator/check');

mongoose
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

// expressValidator
// app.post('/user', [
    // username must be an email
    // check('username').isEmail(),
    // password must be at least 5 chars long
    // check('password').isLength({ min: 5 })
// ], (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(422).json({ errors: errors.array() });
//     }

//     User.create({
//         username: req.body.username,
//         password: req.body.password
//     }).then(user => res.json(user));
// });

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

app.use('/admin', admin_pages)
app.use('/',pages)

app.listen(8000,()=>{
    console.log('server is on')
})