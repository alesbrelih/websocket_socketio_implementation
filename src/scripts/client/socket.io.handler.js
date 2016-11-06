(function(window,io,$){

    //on DOM ready
    $(function(){

        /////////////////////////////////////
        // --------- Properties ------------
        //////////////////////////////////////

        //socket io client software
        const clientIo = io();

        //client info
        let clientInfo = {
            id : "",
            username : ""
        };

        //displayed username
        let usernameSet = false;
        
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



        //////////////////////////////////////////////
        // --------- SocketIo Events-----------------
        ////////////////////////////////////////////
        
        //get socket id on connection to server
        clientIo.on("connect",function(){
            clientInfo.id = this.id;
        });

        //message recieved
        clientIo.on("chat-room-message",(msg)=>{
            let li = `<li class="message"><span class="user-name">${msg.username}</span><p>${msg.message}</p></li>`;
            messageWrapper.append(li);
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

        //when another user leaves session
        clientIo.on("user-left",(user)=>{

            RemoveUserFromUsers(user);

        });

        //on getting a new private message
        clientIo.on("private-message",(data)=>{

            //try to find if private chat with this id already exists
            const chat_window = $(`.private-chat-wrapper .private-chat-list .private-chat[data-socket-id="${data.from.id}"]`);
            
            if(chat_window.length==0){
                //chat window doesnt exist

                //create html markup for new private chat window and append it to DOM
                const windowHtml = CreatePrivateWindow(data.from.id,data.from.username);
                $(".private-chat-list").append(windowHtml);

                //notify user about private message
                NotifyPrivateMessage(data.from.id);

                //get window and msg wrapper
                const new_chat_window = $(`.private-chat-wrapper .private-chat-list .private-chat[data-socket-id="${data.from.id}"]`);
                const messagesWrapper = new_chat_window.find(".private-messages-wrapper");
                
                //append message
                const html = CreatePrivateWindowMessage(data.from.username,data.msg);
                messagesWrapper.append(html);

            }
            else{ //chat window exists

                //notify user about private message
                NotifyPrivateMessage(data.from.id);

                //get message wrapper and append message
                const messagesWrapper = chat_window.find(".private-messages-wrapper");
                const html = CreatePrivateWindowMessage(data.from.username,data.msg);
                messagesWrapper.append(html);
            }

        });
        
        

        

        ////////////////////////////////////////////////////
        // -------- CLIENT ACTIONS ---------------------
        //////////////////////////////////////////////////

        //message sent
        messageSendBtn.on("click",()=>{
            clientIo.emit("chat-room-message",{username:clientInfo.username,message:messageBox.val()});
            messageBox.val("");
        });

        //username selected
        usernameSetBtn.on("click",()=>{
            //get username value and reset username input value
            clientInfo.username = usernameBox.val();
            usernameBox.val("");

            //send user info to socket server
            clientIo.emit("user-joined",clientInfo.username);

            //hide username input
            usernameBoxWrapper.addClass("hide");

            //show messagebox input
            messageBoxWrapper.removeClass("hide");

            usernameSet = true;
        });

        //on click on private chat li make it active/visible
        $(".private-chat-wrapper .private-chat-list").on("click",".private-chat",function(){
            //select already active if exist
            // const existing = $(".private-chat-wrapper .private-chat-list .private-chat.active");
            
            // if(existing){
            //     //remove if one is already active
            //     existing.removeClass("active");

            //     //if active is clicked just close active and stop
            //     // from continuing
            //     if(existing.is(this)){
            //         return;
            //     }
            // }
            const window = this;

            // if both object arent the same
            // just close selected window
            if(!CloseOpenedPrivateChat(window)){ //else

                //open another
                OpenPrivateChatWindow(null,$(this));

                //set current socket id if needed to transmit data
                privateCurrentSocketId = $(this).attr("data-socket-id");

            }

            
        });

        //stop propagation from private user texts window to UL->LI CLICK EVENT 
        //on private windows wrapper
        $(".private-chat-wrapper .private-chat-list").on("click",".private-chat .user-text",function(ev){
            
            //set private socket id if chat was opened and user just clicked input
            privateCurrentSocketId = $(this).parents(".private-chat").attr("data-socket-id");
            ev.stopPropagation();

        });

        //delegate li click for any future elements
        $("#socket-users").on("click","li",function(){

            //check if username was set
            if(usernameSet)
            {

                //client automatically joins its socketid room on connection!
                //working off that
                const socket_id = $(this).attr("data-socket-id");
                privateCurrentSocketId = socket_id; //set current socket id for chat emit
                const username = $(this).text();

                //try to find if private chat with this id already exists
                const chat_window = $(`.private-chat-wrapper .private-chat-list .private-chat[data-socket-id="${socket_id}"]`);

                //close previously opened chat windows
                CloseOpenedPrivateChat();

                //if window doesnt exist add new private window
                if(chat_window.length == 0){
                    const html = CreatePrivateWindow(socket_id,username);
                    privateListWrapper.append(html);

                    OpenPrivateChatWindow(socket_id);

                }
                //else make it active
                else{
                    OpenPrivateChatWindow(null,chat_window);
                    // if(!chat_window.hasClass("active")){
                    //     chat_window.addClass("active");
                    // }

                }

            }
        });

        //private chat send with enter button
        privateListWrapper.on("keydown",".private-chat-send",function(e){

        

            //enter was pressed
            if(e.keyCode==13){

                //msg value
                let msg = $(this).val();


                //get msg wrapper
                const parentPrivateWindow = $(this).parents(".user-text");
                const messagesWrapper = parentPrivateWindow.find(".private-messages-wrapper");
                
                //append ur sent text to msg wrapper
                const html = CreatePrivateWindowMessage(clientInfo.username,msg);
                messagesWrapper.append(html);

                //send msg to private room
                clientIo.emit("private-message",{from:clientInfo,to:privateCurrentSocketId, msg:msg});

                //clear input value
                $(this).val("");

            }
        });

        



        //////////////////////////////////////////////
        // ------- Helper Functions -----------------
        /////////////////////////////////////////////
        
        // CLOSE/OPEN PRIVATE WINDOWS - START

        //close opened private chat window
        function CloseOpenedPrivateChat(privateMessageWindow){

            const existing = $(".private-chat-wrapper .private-chat-list .private-chat.active");
            
            if(existing){
                //remove if one is already active
                existing.removeClass("active");

            
                if(privateMessageWindow)
                {
                    //if active is clicked just close active and stop
                    // from continuing
                    if($(privateMessageWindow).is(existing)){

                        // return that both object represent same
                        return true;
                    }
                }
            }
            return false;

        }

        //open private chatwindow with socket id in parameters
        //if private_chat (private chat window was provided) exists only check classes on that window
        function OpenPrivateChatWindow(socket_id,private_chat){
            if(private_chat){
                //if it doesnt have active class
                if(!private_chat.hasClass("active")){

                    if(private_chat.hasClass("new-message"))
                    {
                        private_chat.removeClass("new-message");
                    }
                    //add active class
                    private_chat.addClass("active");

                }
                //focus input
                private_chat.find("input").focus();
            }
            else{
                //window wasnt provided
                //need to query window and modify classes if needed

                //try to find if private chat with this id already exists
                const chat_window = $(`.private-chat-wrapper .private-chat-list .private-chat[data-socket-id="${socket_id}"]`);

                if(chat_window.length){

                    //if it doesnt have active class
                    if(!chat_window.hasClass("active")){

                        if(chat_window.hasClass("new-message"))
                        {
                            chat_window.removeClass("new-message");
                        }
                        //add active class
                        chat_window.addClass("active");

                    }
                    //focus input
                    chat_window.find("input").focus();
                }
            }

            

        }

        //notify user about new private message
        function NotifyPrivateMessage(socket_id){

            //try to find if private chat with this id already exists
            const chat_window = $(`.private-chat-wrapper .private-chat-list .private-chat[data-socket-id="${socket_id}"]`);

            if(chat_window.length){

                //if it doesnt have active class
                if(!chat_window.hasClass("active")){

                    //add active class
                    chat_window.addClass("new-message");

                }
                
            }
        }

        // CLOSE/OPEN PRIVATE WINDOWS - END


        // --- GENERATE HTML CONTENT - START

        //creates markup for private window message
        function CreatePrivateWindowMessage(from,msg){
            const html = `<li class="private-message"> <div class="username">${from}</div>${msg}</li>`;
            return html;
        }

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

        // --- GENERATE HTML CONTENT - END






    });

    
})(window,window.io,window.$);