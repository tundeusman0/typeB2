const express = require('express');
const router = express.Router();
const { mongoose } = require('./../db/mongoose');
const { MongoClient, ObjectId } = require('mongodb');
const { check, validationResult } = require('express-validator/check');
const Page = require('./../models/pages')
var async = require('async');

router.get('/', (req, res) => {
    
    res.send('admin pages')
    
})

router.get('/pages', (req, res) => {
    Page.find({}).sort({sorting:1}).exec((err,pages)=>{
        res.render('partials/admin/pages.hbs', {
            pages
        })
    })
    // Page.find({},(err,pages)=>{
    //     res.render('partials/admin/pages.hbs', {
    //         pages
    //     })
    // })
})

router.get('/pages/add-pages', (req, res) => {
    let title = req.body.title
    let slug = req.body.slug
    let content = req.body.content
    if (typeof slug){
    req.session.sessionFlash = {
        type: 'error',
        message: 'page slug already exists, choose another one.'
    }
    res.render('partials/admin/add_pages.hbs', {
        title, slug, content
    })
}
})

router.post('/pages/add-pages', [
    check('title').isLength({ min: 3 }).trim().withMessage('Title empty. Must be atleast 3 characters'),
    check('content').isLength({ min: 5 }).trim().withMessage('Content empty. Must be atleast 5 characters')
], (req, res) => {
    let title = req.body.title
    let slug = req.body.slug.replace(/\s+/g,'-').toLowerCase()
    slug === "" && (slug = title.replace(/\s+/g, '-').toLowerCase())
    let content= req.body.content
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('partials/admin/add_pages.hbs', {
            errors: errors.array(), title, slug, content
        })
    }else{
        Page.findOne({slug},(err,page)=>{
            if(page)  {
                console.log(`page slug already exists, choose another one`)
                // req.session.sessionFlash = {
                //     type: 'error',
                //     message: 'page slug already exists, choose another one.'
                // }
                res.render('partials/admin/add_pages.hbs', { title, slug, content})
            }else{
                let page = new Page({ title, slug, content,sorting:0})
                Page.findOne({ slug }, (err, page) => {console.log(page)})
            page.save().then((doc) => {
                console.log(`Page added`)
                req.session.sessionFlash = {
                    type: 'info',
                    message: 'Page added'
                }
                res.redirect('/admin/pages')
            }, (error) => {
                console.log('no data', error)
            })
            }
        })
    }

});

router.post('/reorder-pages', (req,res) => {
    let retriever = Object.keys(req.body)
    let idObject = JSON.parse(retriever)
    let ids = idObject.trId
    let count = 0;
    for (let i = 0; i < ids.length; i++) {
        let id = ids[i]
        count++;
        function counting (count) {
            Page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if (err)
                        return console.log(err)
                })
            })
        }
        counting(count)
    }
})

// router.post('/carousel/add-carousel',()=>{})


module.exports = router
