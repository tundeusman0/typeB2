const express = require('express');
const router = express.Router();
const { NoteAboutSch } = require('../models/noteAboutSch')
const { check, validationResult } = require('express-validator/check');
const mkdirp = require('mkdirp')
var fs = require('fs-extra');
var resizeImg = require('resize-img');

router.get('/', (req, res) => {
    res.send('about_school,add-noteAbtSch')

})

router.get('/about_school', (req, res) => {
    NoteAboutSch.find({}).sort({ sorting: 1 }).exec((err, noteAbtSch) => {
        res.render('admin/noteAbtSch', {
            noteAbtSch
        })
    })
})

router.get('/about_school/add-noteAbtSch', (req, res) => {
    let title = req.body.title
    let content = req.body.content
    let image = req.body.image
    let slug = req.body.slug
    if (typeof slug) {
        res.render('admin/add_noteAbtSch', {
            title, image, slug,content
        })
    }
})


router.post('/about_school/add-noteAbtSch',
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
            res.render('admin/add_noteAbtSch', {
                errors: errors.array(), title, slug, content
            })
        } else if (Object.keys(req.files).length === 0 && req.files.constructor === Object) {
            req.flash('error', 'Please enter an image for noteAboutSch');
            res.render('admin/add_noteAbtSch', { title, content, slug })
        } else {
            NoteAboutSch.findOne({ slug }, (err, noteAbtSch) => {
                if (noteAbtSch) {
                    req.flash('error', 'add_noteAbtSch slug already exists, choose another one');
                    res.render('admin/add_noteAbtSch', { title, slug, content })
                } else {
                    let noteAboutSch = new NoteAboutSch({ title, slug, content, image: imageFile, sorting: 0 })
                    noteAboutSch.save().then((doc) => {
                        mkdirp('public/images/aboutSchoolImages/' + doc._id, function (err) {
                            err && console.log('cant create1', err)
                        });
                        if (imageFile !== "") {
                            var noteAboutSchImage = req.files.image;
                            var path = 'public/images/aboutSchoolImages/' + doc._id + '/' + imageFile;

                            noteAboutSchImage.mv(path, function (err) {
                                err && console.log('cant create2', err);
                            });
                        }
                        console.log(`noteAboutSch added`)
                        req.flash('success', 'noteAboutSch added');
                        res.redirect('/admin/about_school')
                    }).catch((err) => {
                        console.log('no data', err)
                    })
                }
            })
        }
    });

router.post('/reorder-noteAbtSch', (req, res) => {
    let retriever = Object.keys(req.body)
    let idObject = JSON.parse(retriever)
    let ids = idObject.trId
    let count = 0;
    for (let i = 0; i < ids.length; i++) {
        let id = ids[i]
        count++;
        function counting(count) {
            NoteAboutSch.findByIdAndUpdate(id, { $set: { sorting: count } }, { new: true })
                .then((noteAbtSch) => {
                    // console.log(`noteAbtSch re-arranged`)
                    // req.flash('success', 'noteAbtSch re-arranged');
                }, (err) => { }).catch((e) => console.log(e))
        }
        counting(count)
    }

})

router.get('/about_school/edit-noteAbtSch/:slug', (req, res) => {
    NoteAboutSch.findOne({ slug: req.params.slug }).then((noteAbtSch) => {
        res.render('admin/edit_noteAbtSch', {
            title: noteAbtSch.title,
            content: noteAbtSch.content,
            image: noteAbtSch.image,
            slug: noteAbtSch.slug,
            id: noteAbtSch.id
        })
    }, (err) => {
        console.log(err)
    })

})
// router.get('/about_school/noteAbtSch/:slug', (req, res) => {
//     console.log(req.params.slug)
//     NoteAboutSch.findOne({ slug: req.params.slug }).then((noteAbtSch) => {
//         console.log(noteAbtSch)
//         res.render('partials/AboutSch', {
//             title: noteAbtSch.title,
//             content: noteAbtSch.content,
//             image: noteAbtSch.image,
//             // slug: noteAbtSch.slug,
//             id: noteAbtSch.id
//         })
//     }, (err) => {
//         console.log(err)
//     })

// })


router.post('/about_school/edit-noteAbtSch/:slug',
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
            res.render('admin/edit_noteAbtSch', {
                errors: errors.array(), title, slug, content, id, image
            })
        } else if (Object.keys(req.files).length === 0 && req.files.constructor === Object) {
            req.flash('error', 'Please change the image for noteAbtSch');
            res.render('admin/edit_noteAbtSch', { title, content, slug, id, image })
        } else {
            let imageFile = req.files.image.name
            NoteAboutSch.findByIdAndUpdate(id, { $set: { title, slug, content, image: imageFile } }, { new: true }).then((noteAbtSch) => {
                if (imageFile !== "") {
                    let noteAbtSchImage = req.files.image;
                    let path1 = 'public/images/aboutSchoolImages/' + noteAbtSch._id + '/' + image;
                    let path2 = 'public/images/aboutSchoolImages/' + noteAbtSch._id + '/' + imageFile;
                    if (image !== "") {
                        fs.remove(path1, function (err) {
                            err && console.log('cant create2', err);
                        });
                        noteAbtSchImage.mv(path2, function (err) {
                            err && console.log('cant create2', err);
                        });
                    }
                }
                console.log(`noteAbtSch Edited`)
                req.flash('success', 'noteAbtSch Edited');
                res.redirect('/admin/about_school/edit-noteAbtSch/' + noteAbtSch.slug)
            }, (err) => { console.log(err) })
        }

    });

router.get('/about_school/delete-noteAbtSch/:id', (req, res) => {
    let id = req.params.id
    NoteAboutSch.findByIdAndDelete(id).then((deleted) => {
        let path = 'public/images/aboutSchoolImages/' + id + '/' + deleted.image;
        let path2 = 'public/images/aboutSchoolImages/' + id;
        fs.remove(path, function (err) {
            err && console.log('cant create2', err);
        });
        fs.remove(path2, function (err) {
            err && console.log('cant create2', err);
        });
        // console.log(deleted)
        req.flash('success', 'an about_school page Deleted');
        res.redirect('/admin/about_school')
    }, (err) => { console.log(err) })
})


module.exports = router
