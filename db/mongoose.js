const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.set('useFindAndModify', false)

mongoose.connect("mongodb://localhost:27017/typebApp", {
    useCreateIndex: true,
    useNewUrlParser: true
})

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log(`we're connected! to mongoDB`)
});

module.exports = { mongoose }