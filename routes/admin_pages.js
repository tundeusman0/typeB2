const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const {Page} = require('./../models/pages')

router.get('/', (req, res) => {
    res.send('admin pages')
    
})


router.get('/pages', (req, res) => {
    Page.find({}).sort({sorting:1}).exec((err,pages)=>{
        res.render('admin/pages', {
            pages
        })
    })
})

router.get('/pages/add-pages', (req, res) => {
    let title = req.body.title
    let slug = req.body.slug
    let content = req.body.content
    if (typeof slug){
        res.render('admin/add_pages', {
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
        res.render('admin/add_pages', {
            errors: errors.array(), title, slug, content
        })
    }else{
        Page.findOne({slug},(err,page)=>{
            if(page)  {
                req.flash('success', 'page slug already exists, choose another one');
                res.render('admin/add_pages', { title, slug, content})
            }else{
                let page = new Page({ title, slug, content,sorting:0})
                // Page.findOne({ slug }, (err, page) => {console.log(page)})
            page.save().then((doc) => {
                console.log(`Page added`)
                req.flash('success', 'Page added');
                // res.redirect('admin/pages')
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
            Page.findByIdAndUpdate(id, { $set: { sorting:count} }, { new: true })
            .then((pages) => {
                // console.log(`Page re-arranged`)
                // req.flash('success', 'Page re-arranged');
            }, (err) => { }).catch((e)=>console.log(e))
        }
        counting(count)
    }   
})

router.get('/pages/edit-page/:slug', (req, res) => {
    Page.findOne({ slug: req.params.slug }).then((page) => {
        res.render('admin/edit_pages', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        })
    }, (err) => {
        console.log(err)
    })
    
})

router.post('/pages/edit-page/:slug',[
    check('title').isLength({ min: 3 }).trim().withMessage('Title empty. Must be atleast 3 characters'),
    check('content').isLength({ min: 5 }).trim().withMessage('Content empty. Must be atleast 5 characters')
], (req, res) => {
    let title = req.body.title
    let slug = req.body.title.replace(/\s+/g, '-').toLowerCase()
    slug === "" && (slug = title.replace(/\s+/g, '-').toLowerCase())
    let content = req.body.content
    let id = req.body.id

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('admin/edit_pages', {
            errors: errors.array(), title, slug, content,id
        })
    } else {
        Page.findByIdAndUpdate( id , { $set: { title, slug, content } }, { new: true }).then((page)=>{
            console.log(`Page Edited`)
            req.flash('success', 'Page Edited');
            res.redirect('/admin/pages/edit-page/' + slug)
        },(err)=>{})
    }

});

router.get('/pages/delete-page/:id', (req, res) => {
    let id = req.params.id
    Page.findByIdAndDelete(id).then((deleted) => {
        req.flash('success', 'Page Deleted');
        res.redirect('/admin/pages')
    }, (err) => { console.log(err) })
})

// router.post('/carousel/add-carousel',()=>{})


module.exports = router
