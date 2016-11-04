///////////////////////////////////////////////////////////
// ------------ SOCKET IO TEST EXPRESS SERVER -------------
///////////////////////////////////////////////////////////

///////////////////////////////////
// ---- import NPM modules ------ 
/////////////////////////////////
const express = require("express");
const socketIo = require("socket.io");
const ejs = require("ejs");
const path = require("path");

//initialize application
const app  = express();

//set views folder and view engine
app.set("views",path.join(__dirname,"views"));
app.engine("html",ejs.renderFile);

//public folder
app.use(express.static(path.join(__dirname,"public")));

//setting router
app.get("/",function(req,res){
    res.render("index.html");
});

//start express erver on port
app.listen(8001,function(){
	window.console.log("Server running at 8001");
});
