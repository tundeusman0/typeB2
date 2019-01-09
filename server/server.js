const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash');

const {Page} = require('./../models/pages')
const pages  = require('./../routes/pages')
const admin_pages = require('./../routes/admin_pages')
const { mongoose } = require('./../db/mongoose');

// path 
const path = require('path')

// path for partials and public
const publicPath = path.join(__dirname, '/../public')
const partialsPath = path.join(__dirname, '/../views')

const app = express();

// bodyParser
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

app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// set view engine
app.set('view engine', 'ejs')
app.set('views', partialsPath)
// set static path
app.use(express.static(publicPath))
// set global variable
app.locals.errors = null;

// app.locals.errors = null
Page.find({}).sort({ sorting: 1}).then((pages) => {
    app.locals.pages = pages
    // for (var attributename in pages) {
    //     if(pages[attributename].subs){ 
    //         // console.log(pages[attributename].subs[attributename].title)
    //         console.log(pages[attributename].subs)
    //         var arr = pages[attributename].subs
    //         arr.forEach(element => {
    //             console.log(element.title)
    //         });
    //     }else{
    //         console.log(pages[attributename].title)
    //     } 
    // }
    for (let page of pages) {
    if (page.subs) {
        // console.log(page.subs)
        console.log(page.title)
        for(let sub of page.subs){
            console.log(sub.title)
        }
    }else{
        console.log(page.title)
    }
}
    
}, (err) => { console.log(err) })

app.use('/admin', admin_pages)
app.use('/',pages)

app.listen(8000,()=>{
    console.log('server is on')
})