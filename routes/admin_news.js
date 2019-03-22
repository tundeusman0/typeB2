const express = require('express');
const router = express.Router();
const moment = require('moment');
const { News } = require('../models/news')
const { check, validationResult } = require('express-validator/check');
const mkdirp = require('mkdirp')
var fs = require('fs-extra');
var resizeImg = require('resize-img');
let auth = require('./../config/auth')
const isAdmin = auth.isAdmin

router.get('/', isAdmin, (req, res) => {
    res.send('index')

})


router.get('/news', isAdmin, (req, res) => {
    News.find({}).sort({ sorting: 1 }).exec((err, news) => {
        res.render('admin/news', {
            news,
            // created: created.format('MMMM Do YYYY, h:mm:ss a')
        })
    })
})

router.get('/news/add-news',isAdmin, (req, res) => {
    let title = req.body.title
    let content = req.body.content
    let image = req.body.image
    let slug = req.body.slug
    if (typeof slug) {
        res.render('admin/add_news', {
            title, image, slug, content
        })
    }
})


router.post('/news/add-news',
    [
        check('title').isLength({ min: 3 }).trim().withMessage('Title empty. Must be atleast 3 characters'),
        check('content').isLength({ min: 6 }).trim().withMessage('content empty. Must be atleast 6 characters')
    ],
    (req, res) => {
        let title = req.body.title
        let slug = title.replace(/\s+/g, '-').toLowerCase();
        let content = req.body.content
        // let now = moment() moment().format('MMMM Do YYYY, h:mm:ss a')
        let created = moment().format('MMMM Do YYYY, h:mm:ss a')
        console.log(created)
        let imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : ""
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('admin/add_news', {
                errors: errors.array(), title, slug, content, created
            })
        } else if (Object.keys(req.files).length === 0 && req.files.constructor === Object) {
            req.flash('error', 'Please enter an image for news');
            res.render('admin/add_news', { title, content, slug,created })
        } else {
            News.findOne({slug}).then((news)=>{
                if (news) {
                    req.flash('error', 'news slug already exists, choose another one');
                    res.render('admin/add_news', { title, slug, content, created })
                } else {
                    let news = new News({ title, slug, content, created, image: imageFile, sorting: 0 })
                    news.save().then((doc) => {
                        mkdirp('public/images/newsImages/' + doc._id, function (err) {
                            err && console.log('cant create1', err)
                        });
                        if (imageFile !== "") {
                            var newsImage = req.files.image;
                            var path = 'public/images/newsImages/' + doc._id + '/' + imageFile;

                            newsImage.mv(path, function (err) {
                                err && console.log('cant create2', err);
                            });
                        }
                        console.log(`news added`)
                        req.flash('success', 'news added');
                        res.redirect('/admin/news')
                    }).catch((err) => {
                        console.log('no data', err)
                    })
                }
            })
        }
    });

router.post('/reorder-news', (req, res) => {
    let retriever = Object.keys(req.body)
    let idObject = JSON.parse(retriever)
    let ids = idObject.trId
    let count = 0;
    for (let i = 0; i < ids.length; i++) {
        let id = ids[i]
        count++;
        function counting(count) {
            News.findByIdAndUpdate(id, { $set: { sorting: count } }, { new: true })
                .then((news) => {
                    // console.log(`news re-arranged`)
                    // req.flash('success', 'news re-arranged');
                }, (err) => { }).catch((e) => console.log(e))
        }
        counting(count)
    }

})

router.get('/news/edit-news/:slug',isAdmin, (req, res) => {
    News.findOne({ slug: req.params.slug }).then((news) => {
        res.render('admin/edit_news', {
            title: news.title,
            content: news.content,
            image: news.image,
            slug: news.slug,
            id: news.id,
        })
    }, (err) => {
        console.log(err)
    })

})


router.post('/news/edit-news/:slug',
    [
        check('title').isLength({ min: 3 }).trim().withMessage('Title empty. Must be atleast 3 characters'),
        check('content').isLength({ min: 6 }).trim().withMessage('content empty. Must be atleast 6 characters')
    ],
    (req, res) => {
        let title = req.body.title
        let slug = title.replace(/\s+/g, '-').toLowerCase();
        let content = req.body.content
        let id = req.body.id
        let image = req.body.Nimage
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('admin/edit_news', {
                errors: errors.array(), title, slug, content, id, image
            })
        } else if (Object.keys(req.files).length === 0 && req.files.constructor === Object) {
            req.flash('error', 'Please change the image for news');
            res.render('admin/edit_news', { title, content, slug, id, image })
        } else {
            let imageFile = req.files.image.name
            News.findByIdAndUpdate(id, { $set: { title, slug, content, image: imageFile } }, { new: true }).then((news) => {
                if (imageFile !== "") {
                    let newsImage = req.files.image;
                    let path1 = 'public/images/newsImages/' + news._id + '/' + image;
                    let path2 = 'public/images/newsImages/' + news._id + '/' + imageFile;
                    if (image !== "") {
                        fs.remove(path1, function (err) {
                            err && console.log('cant create2', err);
                        });
                        newsImage.mv(path2, function (err) {
                            err && console.log('cant create2', err);
                        });
                    }
                }
                console.log(`news Edited`)
                req.flash('success', 'news Edited');
                res.redirect('/admin/news/edit-news/' + news.slug)
            }, (err) => { console.log(err) })
        }

    });

router.get('/news/delete-news/:id',isAdmin, (req, res) => {
    let id = req.params.id
    News.findByIdAndDelete(id).then((deleted) => {
        let path = 'public/images/newsImages/' + id + '/' + deleted.image;
        let path2 = 'public/images/newsImages/' + id;
        fs.remove(path, function (err) {
            err && console.log('cant create2', err);
        });
        fs.remove(path2, function (err) {
            err && console.log('cant create2', err);
        });
        // console.log(deleted)
        req.flash('success', 'an news page Deleted');
        res.redirect('/admin/news')
    }, (err) => { console.log(err) })
})


module.exports = router
