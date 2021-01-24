const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const { validationResult } = require('express-validator/check');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array()
        throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    bcrypt.hash(password, 12)
        .then(hashedpw => {
            const newUser = new User({
                email: email,
                password: hashedpw,
                name: name
            });
            return newUser.save();

        })
        .then(result => {
            res.status(201).json({
                message: "User created successfully",
                UserId: result._id
            })
        })
        .catch(e => {
            if (!e.statusCode) {
                e.statusCode = 500;
            }
            next(e);
        });
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let fetchedUser;
    User.findOne({ email : email })
        .then(user => {
            if (!user) {
                const e = new Error('User does not exist');
                e.statusCode = 401;
                throw e;
            }
            fetchedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                const e = new Error('Wrong password');
                e.statusCode = 401;
                throw e;
            }

            const accessToken = jwt.sign({
                email: fetchedUser.email,
                userId: fetchedUser._id.toString()
            }, 'thisissecret', { expiresIn: '1h' });

            res.status(200).json({
                accessToken : accessToken,
                userId  : fetchedUser._id.toString()
            })
        })
        .catch(e => {
            if (!e.statusCode) {
                e.statusCode = 500;
            }
            next(e);
        });
}