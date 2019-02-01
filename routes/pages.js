const express = require('express')
const router = express.Router()
const { News } = require('../models/news')
const { Page } = require('../models/pages')
const { Event } = require('../models/event')
const { Eventseason } = require('../models/eventseason')



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
router.get('/admin',(req,res)=>{
    res.render('admin/admin')
})

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