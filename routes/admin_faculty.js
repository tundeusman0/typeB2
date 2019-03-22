const express = require('express');
const router = express.Router();
const { Faculty } = require('../models/faculty')
const { check, validationResult } = require('express-validator/check');
let auth = require('../config/auth')
const isAdmin = auth.isAdmin

router.get('/', isAdmin, (req, res) => {
    res.send('index')

})

router.get('/faculty', isAdmin, (req, res) => {
// router.get('/faculty', (req, res) => {
    Faculty.find({}).sort({ sorting: 1 }).exec((err, faculties) => {
        res.render("admin/faculty", { faculties })
    })
    // .catch((err) => { console.log(err) })
})
router.get('/faculty/add-faculty',isAdmin, (req, res) => {
    let { faculty, slug, content } = req.body
    res.render("admin/add_faculty",{
        faculty,slug,content
    })
})
router.post('/faculty/add-faculty',
    [
        check('faculty').isLength({ min: 3 }).trim().withMessage('faculty empty. Must be atleast 3 characters'),
        check('content').isLength({ min: 5 }).trim().withMessage('content empty. Must be atleast 6 characters')
    ],
 (req, res) => {
     const errors = validationResult(req);
    let {faculty,slug,content} = req.body
     if (!errors.isEmpty()) {
         res.render('admin/faculty/add_faculty', {
             errors: errors.array(), faculty, slug, content
         })
     }else{
        let department = content.split(",")
        slug = faculty.replace(/\s+/g, '-').toLowerCase();
         let faculties = new Faculty({ faculty, slug, department, sorting: 0})
        faculties.save().then((faculty)=>{
            console.log(faculty)
            res.redirect('/admin/faculty')
            req.flash('success',"successful logged in")
        }).catch((err)=>{
            console.log(err)
            res.render('admin/faculty/add_faculty', {
                errors: errors.array(), faculty, slug, content
            })
        })
     }  
})


            

router.post('/reorder-faculty', (req, res) => {
    let retriever = Object.keys(req.body)
    let idObject = JSON.parse(retriever)
    let ids = idObject.trId
    let count = 0;
    for (let i = 0; i < ids.length; i++) {
        let id = ids[i]
        count++;
        function counting(count) {
            Faculty.findByIdAndUpdate(id, { $set: { sorting: count } }, { new: true })
                .then((news) => {
                    // console.log(`news re-arranged`)
                    // req.flash('success', 'news re-arranged');
                }, (err) => { }).catch((e) => console.log(e))
        }
        counting(count)
    }

})

router.get('/faculty/edit-faculty/:slug',isAdmin, (req, res) => {
    Faculty.findOne({ slug: req.params.slug }).then((faculties) => {
        content = faculties.department.join()
        res.render('admin/edit_faculty', {
            faculty: faculties.faculty,
            content,
            slug: faculties.slug,
            id: faculties.id,
        })
    }, (err) => {
        console.log(err)
    })

})


router.post('/faculty/edit-faculty/:slug',
    [
        check('faculty').isLength({ min: 3 }).trim().withMessage('faculty empty. Must be atleast 3 characters'),
        check('content').isLength({ min: 6 }).trim().withMessage('content empty. Must be atleast 6 characters')
    ],
    (req, res) => {
        const errors = validationResult(req);
        let { faculty, slug, content,id } = req.body
        if (!errors.isEmpty()) {
            res.render('admin/faculty/add_faculty', {
                errors: errors.array(), faculty, slug, content
            })
        } else {
            let department = content.split(",")
            slug = faculty.replace(/\s+/g, '-').toLowerCase();
            Faculty.findByIdAndUpdate(id, { $set: { faculty, slug, department} }, { new: true }).then((news) => {
                res.redirect('/admin/faculty')
                req.flash('success', "successful logged in")
            }).catch(err=>{
                console.log(err)
                res.render('admin/faculty/add_faculty', {
                    errors: errors.array(), faculty, slug, content
                })
            })
        }

    });

router.get('/faculty/delete-faculty/:id',isAdmin, (req, res) => {
    let id = req.params.id
    Faculty.findByIdAndDelete(id).then((deleted) => {
        req.flash('success', 'a faculty has been Deleted');
        res.redirect('/admin/faculty')
    }, (err) => { console.log(err) })
})


module.exports = router
