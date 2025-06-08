const mongoose = require("mongoose");
const URL = process.env.MONGO_URL ;

const connentDB = () =>{
    mongoose.connect(URL).then(()=>{
    console.log("connected to DB.");
}).catch(err=>{
    console.log(err) ;
});

}

module.exports = connentDB ;