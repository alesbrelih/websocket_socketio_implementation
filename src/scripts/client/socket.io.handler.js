(function(window,io,$){
    //socket io client software
    const clientIo = io();

    //displayed username
    let _username = "";
    
    //messages sent wrapper (UL)
    const messageWrapper = $("#message-wrapper");

    //message box variables (wrapper, input, submit btn)
    const messageBoxWrapper = $(".input-message");
    const messageBox = $("#chat-message");
    const messageSendBtn = $("#chat-message-send");

    //username box variables (wrapper, input, submit btn)
    const usernameBoxWrapper = $(".input-username");
    const usernameBox = $("#username");
    const usernameSetBtn = $("#set-username");

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

        //hide username input
        usernameBoxWrapper.addClass("hide");

        //show messagebox input
        messageBoxWrapper.removeClass("hide");
    });





})(window,window.io,window.$);