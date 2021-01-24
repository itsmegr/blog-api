const express = require('express');
const User = require('../models/user');

const { body } = require('express-validator/check')
const authController = require('../controllers/auth');



const router = express.Router();

router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid Email')
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(user => {
                if (user) {
                    return Promise.reject('E-mail already in use');
                }
            })
        })
        .normalizeEmail(),
    body('password', 'Too Short')
        .trim()
        .isLength({ min: 5 }),
    body('name', 'Too Short')
        .trim()
        .not()
        .isEmpty()
], authController.signup);

router.post('/login', authController.postLogin);

module.exports = router;