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

//catch io connection - TEST
io.on("connection",function(socket){  
    socket.on("chat-room-message",(msg)=>{
        io.emit("chat-room-message",msg);
    });
});

//start express erver on port
http.listen(8001,function(){
	console.log("Server running at 8001");
});
