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
    .populate('dishes')
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
        
            if(favorite){
                for(var i=0;i<req.body.length;i++){
                    if(favorite.dishes.indexOf(req.body[i]._id) === -1){
                        favorite.dishes.push(req.body[i]._id);
                    }
                }
                favorite.save()
                .then((favorite) => {
                    console.log('Favorite Inserted ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err)); 
    
    
    
            }
        
        else {
            Favorites.create({"user":req.user._id,"dishes":req.body})
            .then((favorite) => {
                Favorites.findById(favorite._id).populate('user').populate('dishes')
                .then((favorite)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite); 
                })}, (err) => next(err));
            
        }
})
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
.get(cors.cors,(req,res,next)=>{
    res.statusCode = 403;
    res.end('GET operation not supported on /favorite' + req.params.dishId);

})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user:req.user._id})
    .then((favorite)=>{
        if(favorite){
            if(favorite.dishes.indexOf(req.params.dishId) === -1){
                favorite.dishes.push(req.params.dishId)
                favorite.save()
                .then((favorite) => {
                    console.log('Favorite Added ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));                 

            }
        }
        else{
            Favorites.create({'user':req.user._id, 'dishes':[req.params.dishId]})
            .then((favorite)=>{
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);                
            }, (err) => next(err))
        }



    }, (err) => next(err))
    .catch((err) => next(err));


})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user:req.user._id})
    .then((favorite)=>{
        if (favorite) {            
            index = favorite.dishes.indexOf(req.params.dishId);
            if (index >= 0) {
                favorite.dishes.splice(index, 1);
                favorite.save()
                .then((favorite) => {
                    console.log('Favorite Deleted ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
        }
        else {
            err = new Error('Favorites not found');
            err.status = 404;
            return next(err);
        }        
    }, (err) => next(err))
    .catch((err) => next(err));

});


module.exports=favoritesRouter;