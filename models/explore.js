let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let exploreSchema = new Schema({
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
    sorting: {
        type: Number,
        required: true
    }
})

let Explore = mongoose.model('Explore', exploreSchema);

module.exports = { Explore}
