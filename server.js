
///////////////////////////////////////////////////////////
// ------------ SOCKET IO TEST EXPRESS SERVER -------------
///////////////////////////////////////////////////////////

///////////////////////////////////
// ---- import NPM modules ------ 
/////////////////////////////////
const express = require("express");
const app  = express();
const http = require("http").Server(app);
const socketIo = require("socket.io");
const io = socketIo(http);
const io_config = require("./config/socket.io.config");
const ejs = require("ejs");
const path = require("path");



//set views folder and view engine
app.set("views",path.join(__dirname,"views"));
app.engine("html",ejs.renderFile);

//public folder
app.use(express.static(path.join(__dirname,"public")));

//setting router
app.get("/",function(req,res){
    res.render("index.html");
});

//configure socket io 
io_config(io);


//start express erver on port
http.listen(8001,function(){
	console.log("Server running at 8001");
});
