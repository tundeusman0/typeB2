const express = require('express');
const router = express.Router();
const {Carousel} = require('../models/carousel')
const { check, validationResult } = require('express-validator/check');
const mkdirp = require('mkdirp')
var fs = require('fs-extra');
var resizeImg = require('resize-img');

router.get('/', (req, res) => {
    res.send('carousel carousels')
    
})

router.get('/carousel', (req, res) => {
    Carousel.find({}).sort({sorting:1}).exec((err,carousel)=>{
        res.render('admin/carousel', {
            carousel
        })
    })
})

router.get('/carousel/add-carousel', (req, res) => {
    let title = req.body.title
    let image = req.body.image
    let desc = req.body.desc
    let slug = req.body.slug
    if (typeof slug){
        res.render('admin/add_carousel', {
            title, image, desc, slug,
    })
}
})


router.post('/carousel/add-carousel',
    [
        check('title').isLength({ min: 3 }).trim().withMessage('Title empty. Must be atleast 3 characters'),
        check('desc').isLength({ min: 6 }).trim().withMessage('desc empty. Must be atleast 6 characters')
    ],
    (req, res) => {
        let title = req.body.title
        let slug = title.replace(/\s+/g, '-').toLowerCase();
        let desc = req.body.desc
        let imageFile = typeof req.files.image !== "undefined"? req.files.image.name:""
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('admin/add_carousel', {
                errors: errors.array(), title, slug, desc
        })
        } else if (Object.keys(req.files).length === 0 && req.files.constructor === Object){
            req.flash('error', 'Please enter an image for carousel');
            res.render('admin/add_carousel', { title, desc, slug })
        }else{   
                Carousel.findOne({ slug }, (err, carousel) => {
                    if (carousel) {
                        req.flash('error', 'carousel slug already exists, choose another one');
                        res.render('admin/add_carousel', { title, slug, desc })
                    } else {
                        let carousel = new Carousel({ title, slug, desc, image:imageFile, sorting: 0 })
                        carousel.save().then((doc) => {
                            mkdirp('public/images/carouselImages/' + doc._id, function (err) {
                                 err && console.log('cant create1',err)
                            }); 
                            if (imageFile !== "") {
                                var carouselImage = req.files.image;
                                var path = 'public/images/carouselImages/' + doc._id + '/' + imageFile;

                                carouselImage.mv(path, function (err) {
                                     err && console.log('cant create2',err);
                                });
                            }
                            console.log(`carousel added`)
                            req.flash('success', 'carousel added');
                            res.redirect('/admin/carousel')
                        }).catch((err)=>{
                            console.log('no data', err)
                        })
                    }
                })
            }
    });

router.post('/reorder-carousel', (req,res) => {
    let retriever = Object.keys(req.body)
    let idObject = JSON.parse(retriever)
    let ids = idObject.trId
    let count = 0;
    for (let i = 0; i < ids.length; i++) {
        let id = ids[i]
        count++;
        function counting (count) {
            Carousel.findByIdAndUpdate(id, { $set: { sorting:count} }, { new: true })
            .then((carousel) => {
                // console.log(`carousel re-arranged`)
                // req.flash('success', 'carousel re-arranged');
            }, (err) => { }).catch((e)=>console.log(e))
        }
        counting(count)
    }
      
})
        
router.get('/carousel/edit-carousel/:slug', (req, res) => {
    Carousel.findOne({ slug: req.params.slug }).then((carousel) => {
        res.render('admin/edit_carousel', {
            title: carousel.title,
            desc: carousel.desc,
            image: carousel.image,
            slug: carousel.slug,
            id: carousel.id
        })
    }, (err) => {
        console.log(err)
    })
    
})

router.post('/carousel/edit-carousel/:slug',
    [
        check('title').isLength({ min: 3 }).trim().withMessage('Title empty. Must be atleast 3 characters'),
        check('desc').isLength({ min: 6 }).trim().withMessage('desc empty. Must be atleast 6 characters')
    ],
    (req, res) => {
        let title = req.body.title
        let slug = title.replace(/\s+/g, '-').toLowerCase();
        let desc = req.body.desc
        let id = req.body.id
        let image = req.body.cimage
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('admin/edit_carousel', {
                errors: errors.array(), title, slug, desc, id, image
            })
        } else if (Object.keys(req.files).length === 0 && req.files.constructor === Object) {
            req.flash('error', 'Please change the image for carousel');
            res.render('admin/edit_carousel', { title, desc, slug, id, image })
        } else {
            let imageFile = req.files.image.name
        Carousel.findByIdAndUpdate( id , { $set: { title, slug, desc, image:imageFile } }, { new: true }).then((carousel)=>{
            if (imageFile !== "") {
                let carouselImage = req.files.image;
                let path1 = 'public/images/carouselImages/' + carousel._id + '/' + image;
                let path2 = 'public/images/carouselImages/' + carousel._id + '/' + imageFile;
                if(image !== ""){
                    fs.remove(path1, function (err) {
                        err && console.log('cant create2', err);
                    });
                    carouselImage.mv(path2, function (err) {
                        err && console.log('cant create2', err);
                    });
                }
            }
            console.log(`carousel Edited`)
            req.flash('success', 'carousel Edited');
            res.redirect('/admin/carousel/edit-carousel/'+carousel.slug)
        },(err)=>{console.log(err)})
    }

});

router.get('/carousel/delete-carousel/:id', (req, res) => {
    let id = req.params.id
    Carousel.findByIdAndDelete(id).then((deleted) => {
        let path = 'public/images/carouselImages/' + id + '/' + deleted.image;
        let path2 = 'public/images/carouselImages/' + id;
        fs.remove(path, function (err) {
            err && console.log('cant create2', err);
        });
        fs.remove(path2, function (err) {
            err && console.log('cant create2', err);
        });
        // console.log(deleted)
        req.flash('success', 'carousel Deleted');
        res.redirect('/admin/carousel')
    }, (err) => { console.log(err) })
})


module.exports = router
