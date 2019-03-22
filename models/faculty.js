var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const validator = require('validator')

var FacultySchema = new Schema({
    faculty:{
        type:String,
        required:true,
        trim: true,
        minlength: 3,
    },
    slug:{
        type:String,
        unique: true,
    },
    department:[{
        type:String,
        minlength: 5,
    }],
    sorting:{
        type:Number,
        required:true
    }

});

let Faculty = mongoose.model('Faculty', FacultySchema);

module.exports = { Faculty}