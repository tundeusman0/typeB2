const express = require('express');
const router = express.Router();
const { Explore } = require('../models/explore')
const { check, validationResult } = require('express-validator/check');
const mkdirp = require('mkdirp')
var fs = require('fs-extra');
var resizeImg = require('resize-img');
let auth = require('./../config/auth')
const isAdmin = auth.isAdmin

router.get('/', isAdmin, (req, res) => {
    res.send('index')

})

router.get('/explore',isAdmin, (req, res) => {
    Explore.find({}).sort({ sorting: 1 }).exec((err, explore) => {
        res.render('admin/explore', {
            explore
        })
    })
})

router.get('/explore/add-explore',isAdmin, (req, res) => {
    let title = req.body.title
    let content = req.body.content
    let image = req.body.image
    let slug = req.body.slug
    if (typeof slug) {
        res.render('admin/add_explore', {
            title, image, slug,content
        })
    }
})


router.post('/explore/add-explore',
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
            res.render('admin/add_explore', {
                errors: errors.array(), title, slug, content
            })
        } else if (Object.keys(req.files).length === 0 && req.files.constructor === Object) {
            req.flash('error', 'Please enter an image for explore');
            res.render('admin/add_explore', { title, content, slug })
        } else {
            Explore.find({}).then((explore)=>{
                if(explore.length === 5){
                    req.flash('error', 'add_explore already 5 in the database, delete one to choose another one');
                    res.render('admin/add_explore', { title, slug, content })
                }
                else if (!explore.filter((note)=>note.slug === slug)) {
                    req.flash('error', 'add_explore slug already exists, choose another one');
                    res.render('admin/add_explore', { title, slug, content })
                } else {
                    let explore = new Explore({ title, slug, content, image: imageFile, sorting: 0 })
                    explore.save().then((doc) => {
                        mkdirp('public/images/exploreImages/' + doc._id, function (err) {
                            err && console.log('cant create1', err)
                        });
                        if (imageFile !== "") {
                            var exploreImage = req.files.image;
                            var path = 'public/images/exploreImages/' + doc._id + '/' + imageFile;

                            exploreImage.mv(path, function (err) {
                                err && console.log('cant create2', err);
                            });
                        }
                        console.log(`explore added`)
                        req.flash('success', 'explore added');
                        res.redirect('/admin/explore')
                    }).catch((err) => {
                        console.log('no data', err)
                    })
                }
            })
        }
    });

router.post('/reorder-explore', (req, res) => {
    let retriever = Object.keys(req.body)
    let idObject = JSON.parse(retriever)
    let ids = idObject.trId
    let count = 0;
    for (let i = 0; i < ids.length; i++) {
        let id = ids[i]
        count++;
        function counting(count) {
            Explore.findByIdAndUpdate(id, { $set: { sorting: count } }, { new: true })
                .then((explore) => {
                    // console.log(`explore re-arranged`)
                    // req.flash('success', 'explore re-arranged');
                }, (err) => { }).catch((e) => console.log(e))
        }
        counting(count)
    }

})

router.get('/explore/edit-explore/:slug',isAdmin, (req, res) => {
    Explore.findOne({ slug: req.params.slug }).then((explore) => {
        res.render('admin/edit_explore', {
            title: explore.title,
            content: explore.content,
            image: explore.image,
            slug: explore.slug,
            id: explore.id
        })
    }, (err) => {
        console.log(err)
    })

})


router.post('/explore/edit-explore/:slug',
    [
        check('title').isLength({ min: 3 }).trim().withMessage('Title empty. Must be atleast 3 characters'),
        check('content').isLength({ min: 6 }).trim().withMessage('content empty. Must be atleast 6 characters')
    ],
    (req, res) => {
        let title = req.body.title
        let slug = title.replace(/\s+/g, '-').toLowerCase();
        let content = req.body.content
        let id = req.body.id
        let image = req.body.Eimage
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('admin/edit_explore', {
                errors: errors.array(), title, slug, content, id, image
            })
        } else if (Object.keys(req.files).length === 0 && req.files.constructor === Object) {
            req.flash('error', 'Please change the image for explore');
            res.render('admin/edit_explore', { title, content, slug, id, image })
        } else {
            let imageFile = req.files.image.name
            Explore.findByIdAndUpdate(id, { $set: { title, slug, content, image: imageFile } }, { new: true }).then((explore) => {
                if (imageFile !== "") {
                    let exploreImage = req.files.image;
                    let path1 = 'public/images/exploreImages/' + explore._id + '/' + image;
                    let path2 = 'public/images/exploreImages/' + explore._id + '/' + imageFile;
                    if (image !== "") {
                        fs.remove(path1, function (err) {
                            err && console.log('cant create2', err);
                        });
                        exploreImage.mv(path2, function (err) {
                            err && console.log('cant create2', err);
                        });
                    }
                }
                console.log(`explore Edited`)
                req.flash('success', 'explore Edited');
                res.redirect('/admin/explore/edit-explore/' + explore.slug)
            }, (err) => { console.log(err) })
        }

    });

router.get('/explore/delete-explore/:id',isAdmin, (req, res) => {
    let id = req.params.id
    Explore.findByIdAndDelete(id).then((deleted) => {
        let path = 'public/images/exploreImages/' + id + '/' + deleted.image;
        let path2 = 'public/images/exploreImages/' + id;
        fs.remove(path, function (err) {
            err && console.log('cant create2', err);
        });
        fs.remove(path2, function (err) {
            err && console.log('cant create2', err);
        });
        // console.log(deleted)
        req.flash('success', 'an explore page Deleted');
        res.redirect('/admin/explore')
    }, (err) => { console.log(err) })
})


module.exports = router
