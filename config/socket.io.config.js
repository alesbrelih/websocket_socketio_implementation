"use strict";
//all users currently on socketIo namespace
const connected_users = [];

//connected user class
class SocketUser{
    constructor(id,username){
        this._id = id;
        this._username = username;
    }
    get id(){
        return this._id;
    }
    get username(){
        return this._username;
    }
    set id(newId){
        this._id = newId;
    }
    set username(newUsername){
        this._username = newUsername;
    }
}

function ConfigureSocketIo(io)
{
    //catch io connection - TEST
    io.on("connection",function(socket){  

        //give connected user all usernames
        socket.emit("users-list",connected_users);

        //private chat for users
        //HINT: socket data could be searched for here aswell
        //instead of sending it through client
        socket.on("private-message",(data)=>{
            io.to(data.to).emit("private-message",{from:data.from,msg:data.msg});
        });

        //user connects to chat with username
        socket.on("user-joined",(username)=>{

            //user to be added to connected users
            //need id and username
            let newUser = new SocketUser(socket.id,username);

            //add username to connected users list
            connected_users.push(newUser);

            //chat gets message that user joined channel with username
            //also socket because this way is less work in client side,
            //i would have to manually add user to list if i wasnt emmiting this to him aswell
            io.emit("user-joined",newUser);
        });

        //some1 sends message, whole namespace gets message
        socket.on("chat-room-message",(msg)=>{
            io.emit("chat-room-message",msg);
        });

        //remove socket from connected users list
        socket.on("disconnect",()=>{
            
            //find user in connected_users array
            const user = connected_users.find((x)=>x.id == socket.id);

            //if user is logged in with username
            if(user){
                
                //find its index
                const user_index = connected_users.indexOf(user);

                //remove user from connected users
                connected_users.splice(user_index,1);

                //send message to other users that user disconnected
                //so it can be removed from their user list
                socket.broadcast.emit("user-left",user);
            }

        });
    });   
}


module.exports = ConfigureSocketIo;