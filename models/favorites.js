const mongoose=require('mongoose');
const Schema =mongoose.Schema;


const dishSchema =new Schema({
    dish:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Dish'
    }
},{
    timestamps:true
});

const favoriteSchema=new Schema({
   user : {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
},
   dishes:[dishSchema]
 } ,{
    timestamps:true
});

var Favorites=mongoose.model('favorites',favoriteSchema);

module.exports=Favorites;