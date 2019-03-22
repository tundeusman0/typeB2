
exports.isAdmin = (req,res,next) =>{
    if (req.isAuthenticated() && res.locals.user.admin === 1) {
        next();
    }  else{
        req.flash("error","Please Login")
        res.redirect("/admin/login");
    }  
}
exports.isStaff = (req, res, next) => {
    if (req.isAuthenticated() && res.locals.user.designation === "lecturer") {
        // console.log(req.isAuthenticated())
        next();
    } else {
        req.flash("error", "Please Login")
        res.redirect("/admin/login-staff");
    }
}
exports.isStudent = (req, res, next) => {
    if (req.isAuthenticated()) {
        // console.log(req.isAuthenticated())
        next();
    } else {
        req.flash("error", "Please Login")
        res.redirect("/admin/login-student");
    }
}
// function isLoggedIn(req, res, next) {

//     if (req.isAuthenticated()) {
//         // console.log(res.locals.user.username)

//         next();
//     }
//     else {
//         res.redirect("/admin/login");
//     }
// }

// module.exports = { isLoggedIn }