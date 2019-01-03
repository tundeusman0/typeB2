const express = require('express');
const router = express.Router();
const { mongoose } = require('./../db/mongoose');
const { check, validationResult } = require('express-validator/check');
const Page = require('./../models/pages')

router.get('/', (req, res) => {
    
    res.send('admin pages')
    
})

router.get('/pages', (req, res) => {
    Page.find({},(err,pages)=>{
        res.render('partials/admin/pages.hbs', {
            pages
        })
    })
})

router.get('/pages/add-pages', (req, res) => {
    let title = req.body.title
    let slug = req.body.slug
    let content = req.body.content

    res.render('partials/admin/add_pages.hbs', {
        title, slug, content
    })
})

router.post('/pages/add-pages', [
    check('title').isLength({ min: 1 }).trim().withMessage('Title empty. Must be atleast 5 characters'),
    check('content').isLength({ min: 10 }).trim().withMessage('Content empty. Must be atleast 10 characters')
], (req, res) => {
    let title = req.body.title
    let slug = req.body.slug
    slug === "" && (slug = title);
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
                req.session.sessionFlash = {
                    type: 'info',
                    message: 'This is a flash message using custom middleware and express-session.'
                }
                // req.flash('danger','page slug already exists, choose another one')
                res.render('partials/admin/add_pages.hbs',{ title,slug,content})
            }else{
                let page = new Page({ title, slug, content})
            page.save().then((doc) => {
                // res.render('partials/admin/add_pages.hbs', {
                //     title: doc.title,
                //     slug: doc.slug,
                //     content: doc.content
                // })
                console.log(`Page added`)
                req.session.sessionFlash = {
                    type: 'info',
                    message: 'This is a flash message using custom middleware and express-session.'
                }
                // req.flash('success','Page added')
                res.redirect('/admin/pages')
            }, (error) => {
                console.log('no data', error)
            })
            }
        })
    }

});

// router.post('/carousel/add-carousel',()=>{})


module.exports = router
