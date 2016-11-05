(function(window,io,$){
    //socket io client software
    const clientIo = io();

    //displayed username
    let _username = "";
    
    //messages sent wrapper (UL)
    const messageWrapper = $("#message-wrapper");

    // users box variables
    const userBoxWrapper = $("#socket-users");

    //message box variables (wrapper, input, submit btn)
    const messageBoxWrapper = $(".input-message");
    const messageBox = $("#chat-message");
    const messageSendBtn = $("#chat-message-send");

    //username box variables (wrapper, input, submit btn)
    const usernameBoxWrapper = $(".input-username");
    const usernameBox = $("#username");
    const usernameSetBtn = $("#set-username");

    //private list variables
    const privateListWrapper = $(".private-chat-list");
    let privateCurrentSocketId = "";


    //function that adds user to users list
    function AddUserToUsers(user){

        const mark_up = `<li data-socket-id=${user._id} class="user center-align">${user._username}</li>`;
        userBoxWrapper.append(mark_up);

    }

    //function that removes user from users list
    function RemoveUserFromUsers(user){
        //remove user from users list
        $("li.user").remove(`[data-socket-id="${user._id}"]`);
    }

    //message sent
    messageSendBtn.on("click",()=>{
        clientIo.emit("chat-room-message",{username:_username,message:messageBox.val()});
        messageBox.val("");
    });
    
    //message recieved
    clientIo.on("chat-room-message",(msg)=>{
        let li = `<li class="message"><span class="user-name">${msg.username}</span><p>${msg.message}</p></li>`;
        messageWrapper.append(li);
    });

    //username selected
    usernameSetBtn.on("click",()=>{
        //get username value and reset username input value
        _username = usernameBox.val();
        usernameBox.val("");

        //send user info to socket server
        clientIo.emit("user-joined",_username);

        //hide username input
        usernameBoxWrapper.addClass("hide");

        //show messagebox input
        messageBoxWrapper.removeClass("hide");
    });

    //when user connects server sends message with all users connected
    clientIo.on("users-list",(connected_users)=>{

        //foreach user add user to users list
        //if there are no users, array is empty
        connected_users.forEach((user)=>{

        AddUserToUsers(user);

        });

        
    });

    //when another user joins channel
    clientIo.on("user-joined",(user)=>{

        AddUserToUsers(user);

    });

    clientIo.on("user-left",(user)=>{

        RemoveUserFromUsers(user);

    });
    


    //on click on private chat li make it active/visible
    $(".private-chat-wrapper .private-chat-list").on("click",".private-chat",function(){
        //select already active if exist
        const existing = $(".private-chat-wrapper .private-chat-list .private-chat.active");
        
        if(existing){
            //remove if one is already active
            existing.removeClass("active");

            //if active is clicked just close active and stop
            // from continuing
            if(existing.is(this)){
                return;
            }
        }

        //open another
        $(this).addClass("active");

        //set current socket id if needed to transmit data
        privateCurrentSocketId = $(this).attr("data-socket-id");
    });

    //stop propagation from private user texts window to UL->LI CLICK EVENT 
    //on private windows wrapper
    $(".private-chat-wrapper .private-chat-list").on("click",".private-chat .user-text",function(ev){
        ev.stopPropagation();
    });

    //delegate li click for any future elements
    $("#socket-users").on("click","li",function(){

        //client automatically joins its socketid room on connection!
        //working off that
        const socket_id = $(this).attr("data-socket-id");
        privateCurrentSocketId = socket_id; //set current socket id for chat emit
        const username = $(this).text();

        //try to find if private chat with this id already exists
        const chat_window = $(`.private-chat-wrapper .private-chat-list .private-chat[data-socket-id="${socket_id}"]`);

        //if window doesnt exist add new private window
        if(chat_window.length == 0){
            const html = CreatePrivateWindow(socket_id,username);
            privateListWrapper.append(html);

        }
        //else make it active
        else{

            if(!chat_window.hasClass("active")){
                chat_window.addClass("active");
            }

        }

        
    });

    //function that creates markup for chat window
    function CreatePrivateWindow(_socketId, _username){
        let html = "";
        html = `<li data-socket-id="${_socketId}" class="private-chat"> 
                    <span class="user-name">
                        ${_username}
                    </span> 
                    <div class="user-text">
                        <ul class="private-messages-wrapper">
                        </ul>
                        <div class="input-field">
                            <input class="message private-chat-send" type="text" placeholder="Your message..">
                        </div>
                    </div> 
                </li>`;
        return html;
    }
    //creates markup for private window message
    function CreatePrivateWindowMessage(from,msg){
        const html = `<li class="private-message"> <div class="username">${from}</div>${msg}</li>`;
        return html;
    }

    privateListWrapper.on("keydown",".private-chat-send",function(e){
        if(e.keyCode==13){
            alert("enter presed");
        }
    });


})(window,window.io,window.$);