const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash');
const fileUpload = require('express-fileupload')


const { User } = require('./../models/user')
const { Page } = require('./../models/pages')
const { Faculty } = require('./../models/faculty')
const { Carousel } = require('./../models/carousel')
const { NoteAboutSch } = require('../models/noteAboutSch')
const { Explore } = require('../models/explore')
const { News } = require('../models/news')
const { Achievements } = require('../models/achievements')
const { Info } = require('../models/info')
const { Event } = require('../models/event')
const { Eventseason } = require('../models/eventseason')
const pages = require('./../routes/pages')
const admin = require('./../routes/admin')
const portal  = require('./../routes/portal')
const admin_pages = require('./../routes/admin_pages')
const admin_faculty = require('./../routes/admin_faculty')
const admin_carousel = require('./../routes/admin_carousel')
const admin_aboutSch = require('./../routes/admin_aboutSch')
const admin_explore = require('./../routes/admin_explore')
const admin_news = require('./../routes/admin_news')
const admin_achievements = require('./../routes/admin_achievements')
const admin_event = require('./../routes/admin_event')
const { mongoose } = require('./../db/mongoose');
const passport = require('passport')


// passport config
require('./../config/passport')(passport)
// path 
const path = require('path')

// path for partials and public
const publicPath = path.join(__dirname, '/../public')
const partialsPath = path.join(__dirname, '/../views')

const app = express();

// Heroku port or local port 
const port = process.env.PORT || 8000;


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

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

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



app.get('*', function (req, res, next) {
//     // res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
});


    Info.findOne({}).then((info) => {
        let schTitle = info.schTitle
        app.locals.schTitle = schTitle
    }, (err) => { console.log(err) })
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
    Achievements.find({}).sort({ sorting: 1 }).then((achievements) => {
        app.locals.achievements = achievements
    }, (err) => { console.log(err) })
    Eventseason.findOne({}).then((event) => {
        let eventseason = event.eventseason
        app.locals.eventseason = eventseason
    }, (err) => { console.log(err) }).catch((e)=>console.log(e))
    Event.findOne({}).sort({ sorting: 1 }).then((event) => {
        app.locals.event = event
    }, (err) => { console.log(err) })
    User.find({designation:'student'}).sort({ sorting: 1 }).then((students) => {
        app.locals.student = students
        // console.log(students)
    }, (err) => { console.log(err) })
    User.find({ designation: 'lecturer' }).sort({ sorting: 1 }).then((lecturers) => {
        app.locals.lecturer = lecturers
        // console.log(lecturers)
    }, (err) => { console.log(err) })


app.use('/admin', admin)
app.use('/portal', portal)
app.use('/', pages)
app.use('/admin', admin_faculty)
app.use('/admin', admin_pages)
app.use('/admin', admin_carousel)
app.use('/admin', admin_aboutSch)
app.use('/admin', admin_explore)
app.use('/admin', admin_news)
app.use('/admin', admin_achievements)
app.use('/admin', admin_event)



app.listen(port,()=>{
    console.log(`server is started on port ${port}`)
})