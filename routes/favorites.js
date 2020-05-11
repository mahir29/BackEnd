const express=require('express');
const authenticate=require('../authenticate');
const bodyParser=require('body-parser');
const Favorites=require('../models/favorites');
const cors=require('./cors');

const favoritesRouter=express.Router();
favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.find({})
    .populate('user')
    .populate('dishes.dish')
    .then((favorite)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(favorite);
    },(err)=>next(err))
    .catch((err)=>next(err))
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne(({user:req.user._id}))
    .then((favorite)=>{
        if(favorite !=null){
            favorite.dishes.push(req.body);
            Favorites.save()
            .then((favorite) => {
                Favorites.findById(favorite._id).populate('user').populate('dishes.dish')
                .then((favorite)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite); 
                })}, (err) => next(err));
        }
        else {
            Favorites.create({user:req.user._id})
            .then((favorite)=>{
                favorite.dishes.push(req.body);
            Favorites.save()
            .then((favorite) => {
                Favorites.findById(favorite._id).populate('user').populate('dishes.dish')
                .then((favorite)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite); 
                })}, (err) => next(err));
            
        }
    )}})
    .catch((err)=>next(err))
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.remove({user:req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));     
});

favoritesRouter.route('/:dishId')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findById({user:req.user._id})
    .populate('user')
    .populate('dishes.dish')
    .then((favorite) => {
        if (favorite != null && favorite.dishes.id(req.params.dishId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite.dishes.id(req.params.dishId));
        }
        else if (favorite == null) {
            err = new Error('Don not have any favorite dish');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne(({user:req.user._id}))
    .then((favorite)=>{
        if (favorite != null && favorite.dishes.id(req.params.dishId) == null){
            favorite.dishes.push(req.body);
            Favorites.save()
            .then((favorite) => {
                Favorites.findById(favorite._id).populate('user').populate('dishes.dish')
                .then((favorite)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite); 
                })}, (err) => next(err));
        }
        else if (favorite == null) {
            err = new Error('You do not have any favorite dish');
            err.status = 404;
            return next(err);
        }
        else if (favorite != null && favorite.dishes.id(req.params.dishId) != null){
            err = new Error('Dish ' + req.params.commentId + ' is already added as favorite');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err)=>next(err))
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne(({user:req.user._id}))
    .then((favorite)=>{
        
        if (favorite != null && favorite.dishes.id(req.params.dishId) != null) {
            favorite.dishes.id(req.params.dishId).remove();
            Favorites.save()
            .then((favorite) => {
                Favorites.findById(favorite._id).populate('user').populate('dishes.dish')
                .then((favorite)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite); 
                })}, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('You do not have any favourite dish');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Dish' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports=favoritesRouter;