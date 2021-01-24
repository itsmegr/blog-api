const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();



const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const keys = require('./util/keys');
const socket = require('./socket');



const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ){
        cb(null,true);
    }
    else{
        cb(null, false);
    }
}


// app.use(bodyParser.urlencoded()) ; //when x-www-form-urlencoded (data format sent through form)
app.use(bodyParser.json());  //because our body content type is application/json
app.use(multer({ storage: fileStorage }).single('image')) //here image is field that you put in frontend
app.use('/images', express.static(path.join(__dirname, 'images')));


//Thats especiaaly for browsers to allow CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


app.use('/feed',feedRoutes);
app.use('/auth',authRoutes);

app.use((error, req,res,next)=>{
    console.log(error);
    let status = error.statusCode || 500;
    let message = error.message;

    if(message.includes('Cast to ObjectId failed')){
        status = 404,
        message = "Could not find the resource"
    }

    if(status==500 && !message.includes('Cast to ObjectId failed')) message = 'Something went wrong on Server Side';

    res.status(status).json({
        message:message, 
        data : error.data
    });
})

mongoose
    .connect(keys.mongoDb.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        const server = app.listen(8080)
        const io = require('./socket.js').init(server);
        io.on('connection', socket =>{
            console.log('client connected');
        })
    }).catch(e => {
        console.log(e);
    })