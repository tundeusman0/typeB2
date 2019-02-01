var mongoose = require('mongoose');
let moment = require('moment') 

const eventSchema = mongoose.Schema({
   title: { 
        type: String 
    },
    desc: { 
        type: String 
    },
    slug: { 
        type: String 
    },
    datefrom:{
        type: String,
        default: moment().format('MMMM Do YYYY')
    },
    dateto:{
        type: String,
        default: moment().format('MMMM Do YYYY')
    },
    sorting: {
        type: Number,
        required: true
    }
});

let Event = mongoose.model('Event', eventSchema);

module.exports = {Event}