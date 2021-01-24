const { validationResult } = require('express-validator/check');
const Post = require('../models/post');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
    // console.log(req);
    const currentPage = +req.query.page || 1;
    const perPage = 2;
    let totalItem;
    try{
        totalItem = await Post.find().countDocuments();
        const posts = await Post.find().skip((currentPage - 1) * perPage).limit(perPage);
    
        res.status(200).json({
            message: "all the posts fetched successfully",
            posts: posts,
            totalItem: totalItem
        })
    }
    catch (e){
        if (!e.statusCode) {
            e.statusCode = 500;
        }
        next(e);
    }

}


exports.postPost = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Not Validate inputs, Too Short Inputs');
        error.statusCode = 422;
        throw error;
    }


    if (!req.file) {
        const error = new Error('Image is not uploaded');
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path;
    const userId = req.userId;
    let postId;
    let creator;

    const newPost = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: userId
    })

    newPost.save()
        .then(result => {
            postId = result._id;
            return User.findById(userId);
        })
        .then(user => {
            creator = user;
            user.posts.push(postId);
            return user.save()
        })
        .then(result => {
            res.status(201).json({
                message: 'Post created successfully',
                postId: postId,
                author: result.name
            })
        })
        .catch(e => {
            if (!e.statusCode) {
                e.statusCode = 500;
            }
            next(e);
        });
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find the post');
                error.statusCode = 404;
                throw error;
            }

            res.status(200).json({
                message: "Post fetched",
                post: post
            })
        })
        .catch(e => {
            if (!e.statusCode) {
                e.statusCode = 500;
            }
            next(e);
        });
}

exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Not Validate inputs, Too Short Inputs');
        error.statusCode = 422;
        throw error;
    }

    const postId = req.params.postId;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find the post');
                error.statusCode = 404;
                throw error;
            }

            if (post.creator.toString() != req.userId.toString()) {
                const error = new Error('Not Authorized');
                error.statusCode = 403;
                throw error;
            }
            post.title = req.body.title;
            post.content = req.body.content;
            if (req.file) {
                // new image is given
                //delete the old image
                deleteImage(post.imageUrl);
                post.imageUrl = req.file.path;
            }
            return post.save()
        })
        .then(result => {
            res.status(200).json({
                message: "updated Successfully",
                post: result
            })
        })
        .catch(e => {
            if (!e.statusCode) {
                e.statusCode = 500;
            }
            next(e);
        });


}


exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find the post');
                error.statusCode = 404;
                throw error;
            }
            if (post.creator.toString() != req.userId.toString()) {
                const error = new Error('Not Authorized');
                error.statusCode = 403;
                throw error;
            }
            deleteImage(post.imageUrl);
            return User.findById(req.userId);
        })
        .then(user => {
            //one way
            // const newPosts = user.posts.filter(p =>{
            //     return p.toString()!=postId.toString()
            // })
            // user.posts = newPosts;
            user.posts.pull(postId);
            return user.save()
        })
        .then(result => {
            return Post.findByIdAndDelete(postId)
        })
        .then(result => {
            res.status(200).json({
                message: 'Post Deleted successfully'
            })
        })
        .catch(e => {
            if (!e.statusCode) {
                e.statusCode = 500;
            }
            next(e);
        });

}

const deleteImage = (imagePath) => {
    fs.unlink(path.join(__dirname, '..', imagePath), (err) => {
        // console.log(err, 'not deleted')
        if (err) {
            err.statusCode = 500;
            throw err;
        }
    })
}