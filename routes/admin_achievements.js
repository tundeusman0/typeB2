const express = require('express');
const router = express.Router();
const { Achievements } = require('../models/achievements')
const { check, validationResult } = require('express-validator/check');
const mkdirp = require('mkdirp')
var fs = require('fs-extra');
var resizeImg = require('resize-img');
let auth = require('./../config/auth')
const isAdmin = auth.isAdmin

router.get('/', isAdmin, (req, res) => {
    res.send('index')

})

router.get('/achievements',isAdmin, (req, res) => {
    Achievements.find({}).sort({ sorting: 1 }).exec((err, achievements) => {
        res.render('admin/achievements', {
            achievements
        })
    })
})

router.get('/achievements/add-achievements',isAdmin, (req, res) => {
    let title = req.body.title
    let content = req.body.content
    let image = req.body.image
    let slug = req.body.slug
    if (typeof slug) {
        res.render('admin/add_achievements', {
            title, image, slug,content
        })
    }
})


router.post('/achievements/add-achievements',
    [
        check('title').isLength({ min: 3 }).trim().withMessage('Title empty. Must be atleast 3 characters'),
        check('content').isLength({ min: 6 }).trim().withMessage('content empty. Must be atleast 6 characters')
    ],
    (req, res) => {
        let title = req.body.title
        let slug = title.replace(/\s+/g, '-').toLowerCase();
        let content = req.body.content
        let imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : ""
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('admin/add_achievements', {
                errors: errors.array(), title, slug, content
            })
        } else if (Object.keys(req.files).length === 0 && req.files.constructor === Object) {
            req.flash('error', 'Please enter an image for achievements');
            res.render('admin/add_achievements', { title, content, slug })
        } else {
            Achievements.find({}).then((achievements)=>{
                if(achievements.length === 4){
                    req.flash('error', 'add_achievements already 4 in the database, delete one to choose another one');
                    res.render('admin/add_achievements', { title, slug, content })
                }
                else if (!achievements.filter((note)=>note.slug === slug)) {
                    req.flash('error', 'add_achievements slug already exists, choose another one');
                    res.render('admin/add_achievements', { title, slug, content })
                } else {
                    let achievements = new Achievements({ title, slug, content, image: imageFile, sorting: 0 })
                    achievements.save().then((doc) => {
                        mkdirp('public/images/achievementsImages/' + doc._id, function (err) {
                            err && console.log('cant create1', err)
                        });
                        if (imageFile !== "") {
                            var achievementsImage = req.files.image;
                            var path = 'public/images/achievementsImages/' + doc._id + '/' + imageFile;

                            achievementsImage.mv(path, function (err) {
                                err && console.log('cant create2', err);
                            });
                        }
                        console.log(`achievements added`)
                        req.flash('success', 'achievements added');
                        res.redirect('/admin/achievements')
                    }).catch((err) => {
                        console.log('no data', err)
                    })
                }
            })
        }
    });

router.post('/reorder-achievements', (req, res) => {
    let retriever = Object.keys(req.body)
    let idObject = JSON.parse(retriever)
    let ids = idObject.trId
    let count = 0;
    for (let i = 0; i < ids.length; i++) {
        let id = ids[i]
        count++;
        function counting(count) {
            Achievements.findByIdAndUpdate(id, { $set: { sorting: count } }, { new: true })
                .then((achievements) => {
                    // console.log(`achievements re-arranged`)
                    // req.flash('success', 'achievements re-arranged');
                }, (err) => { }).catch((e) => console.log(e))
        }
        counting(count)
    }

})

router.get('/achievements/edit-achievements/:slug',isAdmin, (req, res) => {
    Achievements.findOne({ slug: req.params.slug }).then((achievements) => {
        res.render('admin/edit_achievements', {
            title: achievements.title,
            content: achievements.content,
            image: achievements.image,
            slug: achievements.slug,
            id: achievements.id
        })
    }, (err) => {
        console.log(err)
    })

})


router.post('/achievements/edit-achievements/:slug',
    [
        check('title').isLength({ min: 3 }).trim().withMessage('Title empty. Must be atleast 3 characters'),
        check('content').isLength({ min: 6 }).trim().withMessage('content empty. Must be atleast 6 characters')
    ],
    (req, res) => {
        let title = req.body.title
        let slug = title.replace(/\s+/g, '-').toLowerCase();
        let content = req.body.content
        let id = req.body.id
        let image = req.body.Aimage
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('admin/edit_achievements', {
                errors: errors.array(), title, slug, content, id, image
            })
        } else if (Object.keys(req.files).length === 0 && req.files.constructor === Object) {
            req.flash('error', 'Please change the image for achievements');
            res.render('admin/edit_achievements', { title, content, slug, id, image })
        } else {
            let imageFile = req.files.image.name
            Achievements.findByIdAndUpdate(id, { $set: { title, slug, content, image: imageFile } }, { new: true }).then((achievements) => {
                if (imageFile !== "") {
                    let achievementsImage = req.files.image;
                    let path1 = 'public/images/achievementsImages/' + achievements._id + '/' + image;
                    let path2 = 'public/images/achievementsImages/' + achievements._id + '/' + imageFile;
                    if (image !== "") {
                        fs.remove(path1, function (err) {
                            err && console.log('cant create2', err);
                        });
                        achievementsImage.mv(path2, function (err) {
                            err && console.log('cant create2', err);
                        });
                    }
                }
                console.log(`Achievements Edited`)
                req.flash('success', 'achievements Edited');
                res.redirect('/admin/achievements/edit-achievements/' + achievements.slug)
            }, (err) => { console.log(err) })
        }

    });

router.get('/achievements/delete-achievements/:id',isAdmin, (req, res) => {
    let id = req.params.id
    Achievements.findByIdAndDelete(id).then((deleted) => {
        let path = 'public/images/achievementsImages/' + id + '/' + deleted.image;
        let path2 = 'public/images/achievementsImages/' + id;
        fs.remove(path, function (err) {
            err && console.log('cant create2', err);
        });
        fs.remove(path2, function (err) {
            err && console.log('cant create2', err);
        });
        // console.log(deleted)
        req.flash('success', 'an Achievements page Deleted');
        res.redirect('/admin/achievements')
    }, (err) => { console.log(err) })
})


module.exports = router
