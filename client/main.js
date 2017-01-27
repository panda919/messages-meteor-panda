Meteor.subscribe("chats");
Meteor.subscribe("messages");
Meteor.subscribe("users");
Meteor.subscribe("emojis");

// set up the main template the the router will use to build pages
Router.configure({
  layoutTemplate: 'ApplicationLayout'
});
// specify the top level route, the page users see when they arrive at the site
Router.route('/', function () {
  console.log("rendering root /");
  this.render("navbar", {to:"header"});
  this.render("lobby_page", {to:"main"});  
});

// specify a route that allows the current user to chat to another users
Router.route('/chat/:_id', function () {
  if (!Meteor.user()){
    alert("You need to login first")
  }
  else{
    var otherUserId = this.params._id;
    // find a chat that has two users that match current user id
    // and the requested user id
    console.log("My user: " + Meteor.userId())
    console.log("Other user: " + this.params._id)
    //var filter = 
    var chat = Chats.findOne({$or:[
                {user1Id:Meteor.userId(), user2Id:otherUserId}, 
                {user2Id:Meteor.userId(), user1Id:otherUserId}
                ]});

    if (!chat){// no chat matching the filter - need to insert a new one
      console.log("no matching chats, creating a new one");
      chatId = Meteor.call("addChat", otherUserId);
    }
    else {// there is a chat going already - use that. 
      chatId = chat._id;
    }
    if (chatId){// looking good, save the id to the session
      console.log("ChatID: " + chatId);
      Session.set("chatId",chatId);
    }
    this.render("navbar", {to:"header"});
    this.render("chat_page", {to:"main"});  
  }
});

///
// helper functions 
/// 
Template.available_user_list.helpers({
  users:function(){
    return Meteor.users.find();
  }
})
Template.available_user.helpers({
  getUsername:function(userId){
    user = Meteor.users.findOne({_id:userId});
    return user.profile.username;
  }, 
  isMyUser:function(userId){
    if (userId == Meteor.userId()){
      return true;
    }
    else {
      return false;
    }
  }
})


Template.chat_page.helpers({
  messages:function(){
    console.log("Find chat session: " +  Session.get("chatId"));
    msgs = Messages.find({chat_id:Session.get("chatId")}).fetch();
    for (i = 0; i < msgs.length; i++){
      profile = getProfile(msgs[i].user)
      msgs[i].profile = profile;
    }
    return msgs
  }, 
  other_user:function(){
    return ""
  },
  isMyUser:function(userId){
  if (userId == Meteor.userId()){
    return true;
    }
  else {
    return false;
    }
  }

})


Template.chat_page.events({
// this event fires when the user sends a message on the chat page
'submit .js-send-chat':function(event){
  // stop the form from triggering a page reload
  event.preventDefault();
  // see if we can find a chat object in the database
  // to which we'll add the message
  var chat = Chats.findOne({_id:Session.get("chatId")});
  if (chat){// ok - we have a chat to use
    message = {message:event.target.chat.value,
              timestamp:+(new Date()),
              chat_id: chat._id
            };
    Meteor.call("addMessage", message);
    }
  }

})


function getProfile(user){
  profile = Meteor.users.findOne({_id:user}, {_id:false, profile:true});
  return profile.profile
}