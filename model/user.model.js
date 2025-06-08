const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema =  mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["customer","admin"],
        required:true,
        default:"customer"
    }
});

userSchema.methods.generateAuthToken = function (){
    const token= jwt.sign({_id:this._id},process.env.SECRET_KEY,{expiresIn:"24h"});
    return token ;
};

userSchema.methods.comparePassword = async function (password){
    return await bcrypt.compare(password,this.password);
};

userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password,10);
};

const userModel = mongoose.model("User",userSchema);

module.exports = userModel ;