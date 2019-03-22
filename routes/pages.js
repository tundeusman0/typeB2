const express = require('express')
const router = express.Router()
// const { News } = require('../models/news')
const { Page } = require('../models/pages')
const { Event } = require('../models/event')
const { Eventseason } = require('../models/eventseason')
const { NoteAboutSch } = require('../models/noteAboutSch')
const { Explore } = require('../models/explore')
const { News } = require('../models/news')
const { Achievements } = require('../models/achievements')



router.get('/',(req,res)=>{
    res.render('index')
})
router.get('/news', (req, res) => {
    News.find({}).sort({ sorting: 1 }).then((news) => {
        res.render('partials/allNews', {
            news
        })
    }, (err) => {
        console.log(err)
    })
})
router.get('/about_school/noteAbtSch/:slug', (req, res) => {
    NoteAboutSch.findOne({ slug: req.params.slug }).then((noteAbtSch) => {
        res.render('partials/AboutSch', {
            title: noteAbtSch.title,
            content: noteAbtSch.content,
            image: noteAbtSch.image,
            id: noteAbtSch.id,
        })
    }, (err) => {
        console.log(err)
    })
})

router.get('/explore/:slug', (req, res) => {
    Explore.findOne({ slug: req.params.slug }).then((explore) => {
        res.render('partials/explores', {
            title: explore.title,
            content: explore.content,
            image: explore.image,
            id: explore.id,
        })
    }, (err) => {
        console.log(err)
    })
})
router.get('/news/:slug', (req, res) => {
    News.findOne({ slug: req.params.slug }).then((news) => {
        res.render('partials/new', {
            title: news.title,
            content: news.content,
            image: news.image,
            created: news.created,
            id: news.id,
        })
    }, (err) => {
        console.log(err)
    })
})


router.get('/achievements/:slug', (req, res) => {
    Achievements.findOne({ slug: req.params.slug }).then((achievements) => {
        res.render('partials/achievements', {
            title: achievements.title,
            content: achievements.content,
            image: achievements.image,
            created: achievements.created,
            id: achievements.id,
        })
    }, (err) => {
        console.log(err)
    })
})
// router.get('/admin',(req,res)=>{
//     res.render('admin/admin')
// })

router.get('/event',(req,res)=>{
    Eventseason.find({}).then((events)=>{
        let eventseason = events[0].eventseason
        Event.find({}).then((event)=>{
            res.render('partials/event',{
                event,
                eventseason
            })
        })
    }).catch((e)=>console.log(e))
    
})
router.get('/:slug', (req, res) => {
    Page.findOne({ slug: req.params.slug }).then((pages) => {
        if (!pages) { //if page not exist in db
            return res.status(404).send('Page not found');
        }
        res.render('partials/pages', {
            title: pages.title,
            content: pages.content,
            id: pages.id,

        })
    }, (err) => {
        console.log(err)
    }).catch((err) => console.log(err))
})



module.exports = router