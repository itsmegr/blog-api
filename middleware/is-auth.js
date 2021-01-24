const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
    //send in header
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const e = new Error('Not Authenticated');
        e.statusCode = 401;
        throw e;
    }
    const accessToken = authHeader.split(' ')[1];
    let payLoad;
    try{
        payLoad = jwt.verify(accessToken, 'thisissecret');
    }
    catch(e){
        e.statusCode = 401;
        throw e;
    }
    //this will be rare
    if(!payLoad){
        const e = new Error('Not Authenticated');
        e.statusCode = 401;
        throw e;
    }

    req.userId = payLoad.userId;
    next();
}