const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required : true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type:Object,
        default : 'I am new'
    },
    posts : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Post'
        }
    ]
})
 //timestamp will automatically create , created at and 
//updated at field in all the documents of this schema 


module.exports = mongoose.model('User', userSchema);