const express = require('express');
const router = express.Router();
const moment = require('moment');
const { Event } = require('../models/event')
const { Eventseason } = require('../models/eventseason')
const { check, validationResult } = require('express-validator/check');
const mkdirp = require('mkdirp')
var fs = require('fs-extra');
var resizeImg = require('resize-img');
let auth = require('./../config/auth')
const isAdmin = auth.isAdmin;

router.get('/', isAdmin, (req, res) => {
    res.send('event index')

})

router.post('/season-event', (req, res) => {
    let eventseason = Object.keys(req.body)[0]
    if(eventseason.length < 9){
        req.flash('error', 'Season length should be 9 or more');
        res.redirect('/admin/eventitle');
    }else{
    Eventseason.findOne({}).then((info)=>{
        
            if (info.eventseason === eventseason){
                req.flash('error', 'Season already exits, update to another one');
                res.redirect('/admin/eventitle');
            }
            else{ 
            // if(info.length === 0){
                console.log(info.length)
                console.log(info)
                let id = info.id
                Eventseason.findByIdAndUpdate(id, { $set: { eventseason } }, { new: true })
                    .then((eventseason) => {
                        console.log(`Event Season updated`)
                        req.flash('success', 'Event Season updated')
                        res.redirect('/admin/eventitle');
                    }, (err) => { }).catch((e) => console.log(e))
                
            // }
        // }).catch((e)=>{console.log(e)})
    }
})
    }
})
router.get('/event/eventitle',isAdmin, (req, res) => {
    Eventseason.find({}).then((events)=>{
        let eventseason = events[0].eventseason
            res.render('admin/eventitle', {
                eventseason
            })
    }).catch((e)=>(res.status(404).send('Page not found')))
})

router.get('/event', (req, res) => {
    Eventseason.find({}).then((events)=>{
        let eventseason = events[0].eventseason
        Event.find({}).sort({ sorting: 1 }).exec((err, event) => {
            res.render('admin/event', {
                event,
                eventseason
            })
        })
    }).catch((e)=>(res.status(404).send('Page not found')))
})

router.get('/event/add-event',isAdmin, (req, res) => {
    let title = req.body.title
    let desc = req.body.desc
    let slug = req.body.slug
    let datefrom = req.body.datefrom
    let dateto = req.body.dateto
    if (typeof slug) {
        res.render('admin/add_event', {
            title, slug, desc, datefrom, dateto
        })
    }
})


router.post('/event/add-event',
    [
        check('title').isLength({ min: 3 }).trim().withMessage('Title empty. Must be atleast 3 characters'),
        check('desc').isLength({ min: 6 }).trim().withMessage('desc empty. Must be atleast 6 characters')
    ],
    (req, res) => {
        let title = req.body.title
        let slug = title.replace(/\s+/g, '-').toLowerCase();
        let desc = req.body.desc
        let datefrom = req.body.datefrom
        let dateto = req.body.dateto
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('admin/add_event', {
                errors: errors.array(), title, slug, desc, datefrom, dateto
            })
        }else {
            Event.findOne({slug}).then((event)=>{
                if (event) {
                    req.flash('error', 'event slug already exists, choose another one');
                    res.render('admin/add_event', { title, slug, desc, datefrom, dateto })
                } else {
                    let event = new Event({ title, slug, desc, datefrom, dateto, sorting: 0 })
                    event.save().then((doc) => {
                        console.log(`event added`)
                        req.flash('success', 'event added');
                        res.redirect('/admin/event')
                    }).catch((err) => {
                        console.log('no data', err)
                    })
                }
            })
        }
    });

router.post('/reorder-event', (req, res) => {
    let retriever = Object.keys(req.body)
    let idObject = JSON.parse(retriever)
    let ids = idObject.trId
    let count = 0;
    for (let i = 0; i < ids.length; i++) {
        let id = ids[i]
        count++;
        function counting(count) {
            Event.findByIdAndUpdate(id, { $set: { sorting: count } }, { new: true })
                .then((event) => {
                    // console.log(`event re-arranged`)
                    // req.flash('success', 'event re-arranged');
                }, (err) => { }).catch((e) => console.log(e))
        }
        counting(count)
    }

})

router.get('/event/edit-event/:slug', isAdmin, (req, res) => {
    Event.findOne({ slug: req.params.slug }).then((event) => {
        res.render('admin/edit_event', {
            title: event.title,
            desc: event.desc,
            datefrom: event.datefrom,
            dateto: event.dateto,
            slug: event.slug,
            id: event.id,
        })
    }, (err) => {
        console.log(err)
    })

})


router.post('/event/edit-event/:slug',
    [
        check('title').isLength({ min: 3 }).trim().withMessage('Title empty. Must be atleast 3 characters'),
        check('desc').isLength({ min: 6 }).trim().withMessage('desc empty. Must be atleast 6 characters')
    ],
    (req, res) => {
        let title = req.body.title
        let slug = title.replace(/\s+/g, '-').toLowerCase();
        let desc = req.body.desc
        let id = req.body.id
        let datefrom = req.body.datefrom
        let dateto = req.body.dateto
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('admin/edit_event', {
                errors: errors.array(), title, slug, desc, id, datefrom, dateto
            })
        } else {
            Event.findByIdAndUpdate(id, { $set: { title, slug, desc, datefrom, dateto } }, { new: true }).then((event) => {
                console.log(`event Edited`)
                req.flash('success', 'event Edited');
                res.redirect('/admin/event/edit-event/' + event.slug)
            }, (err) => { console.log(err) })
        }

    });

router.get('/event/delete-event/:id', isAdmin, (req, res) => {
    let id = req.params.id
    Event.findByIdAndDelete(id).then((deleted) => {
        req.flash('success', 'an event page Deleted');
        res.redirect('/admin/event')
    }, (err) => { console.log(err) })
})


module.exports = router;
