const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const postShema = new Schema({
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required : true
    },
    content: {
        type: String,
        required: true
    },
    creator: {
        type:Schema.Types.ObjectId,
        ref: 'User',
        required:true
    }
}, { timestamps: true })
 //timestamp will automatically create , created at and 
//updated at field in all the documents of this schema 


module.exports = mongoose.model('Post', postShema);