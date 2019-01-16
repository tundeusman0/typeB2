let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let moment = require('moment') 

let newsSchema = new Schema({
    title:{
        type:String,
        required:true,
        minlength: 3
    },
    content:{
        type:String,
        minlength: 6
    },
    image:{
        type:String,
        required:true
    },
    slug: {
        type: String
    },
    created: {
        type: String,
        default: moment().format('MMMM Do YYYY, h:mm:ss a')
    },
    sorting: {
        type: Number,
        required: true
    }
})

let News = mongoose.model('News', newsSchema);

module.exports = {News}
