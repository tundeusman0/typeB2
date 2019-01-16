const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash');
const fileUpload = require('express-fileupload')
// const busboy = require('connect-busboy');

const { Page } = require('./../models/pages')
const { Carousel } = require('./../models/carousel')
const { NoteAboutSch } = require('../models/noteAboutSch')
const { Explore } = require('../models/explore')
const { News } = require('../models/news')
const pages  = require('./../routes/pages')
const admin_pages = require('./../routes/admin_pages')
const admin_carousel = require('./../routes/admin_carousel')
const admin_aboutSch = require('./../routes/admin_aboutSch')
const admin_explore = require('./../routes/admin_explore')
const admin_news = require('./../routes/admin_news')
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
app.use(bodyParser.json({
    type: function (req) {
        return req.get('content-type').indexOf('multipart/form-data') !== 0;
    },
}));

// express session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

// express-messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// express fileUpload middleware
app.use(fileUpload())

// set view engine
app.set('view engine', 'ejs')
app.set('views', partialsPath)
// set static path
app.use(express.static(publicPath))
// set global variable
app.locals.errors = null;
Carousel.find({}).sort({ sorting: 1 }).then((carousel) => {
    app.locals.carousel = carousel
}, (err) => { console.log(err) })
Page.find({}).sort({ sorting: 1 }).then((pages) => {
    app.locals.pages = pages
}, (err) => { console.log(err) })
NoteAboutSch.find({}).sort({ sorting: 1 }).then((noteAbtSch) => {
    app.locals.noteAbtSch = noteAbtSch
}, (err) => { console.log(err) })
Explore.find({}).sort({ sorting: 1 }).then((explore) => {
    app.locals.explore = explore
}, (err) => { console.log(err) })

app.use(function (req, res, next) {
    Carousel.find({}).sort({ sorting: 1 }).then((carousel) => {
        app.locals.carousel = carousel
    }, (err) => { console.log(err) })

    Page.find({}).sort({ sorting: 1 }).then((pages) => {
        app.locals.pages = pages
    }, (err) => { console.log(err) })
    NoteAboutSch.find({}).sort({ sorting: 1 }).then((noteAbtSch) => {
        app.locals.noteAbtSch = noteAbtSch
    }, (err) => { console.log(err) })
    Explore.find({}).sort({ sorting: 1 }).then((explore) => {
        app.locals.explore = explore
    }, (err) => { console.log(err) })
    News.find({}).sort({ sorting: 1 }).then((news) => {
        app.locals.news = news
    }, (err) => { console.log(err) })
    next();
});
app.get('/about_school/noteAbtSch/:slug', (req, res) => {
    NoteAboutSch.findOne({ slug: req.params.slug }).then((noteAbtSch) => {
        res.render('partials/AboutSch', {
            title: noteAbtSch.title,
            content: noteAbtSch.content,
            image: noteAbtSch.image,
            id: noteAbtSch.id
        })
    }, (err) => {
        console.log(err)
    })
})

app.get('/explore/:slug', (req, res) => {
    Explore.findOne({ slug: req.params.slug }).then((explore) => {
        res.render('partials/explores', {
            title: explore.title,
            content: explore.content,
            image: explore.image,
            id: explore.id
        })
    }, (err) => {
        console.log(err)
    })
})
app.get('/news/:slug', (req, res) => {
    News.findOne({ slug: req.params.slug }).then((news) => {
        res.render('partials/new', {
            title: news.title,
            content: news.content,
            image: news.image,
            created: news.created,
            id: news.id
        })
    }, (err) => {
        console.log(err)
    })
})
app.get('/news', (req, res) => {
    News.find({}).sort({ sorting: 1 }).then((news) => {
        res.render('partials/allNews', {
            news
        })
    }, (err) => {
        console.log(err)
    })
})

app.use('/', pages)
app.use('/admin', admin_pages)
app.use('/admin', admin_carousel)
app.use('/admin', admin_aboutSch)
app.use('/admin', admin_explore)
app.use('/admin', admin_news)

app.listen(8000,()=>{
    console.log('server is on')
})