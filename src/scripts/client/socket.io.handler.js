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





})(window,window.io,window.$);