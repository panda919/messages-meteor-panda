Meteor.methods({

	addMessage:function(message){
		console.log("addMessage method");
		if (this.userId) { //Logged in user
			message.user = this.userId;
			console.log(message)
			return Messages.insert(message);
		}
		else{
			return;
		}
	}, // end addMessage

	addChat:function(otherUserId){
		console.log("addChat method");
		if (this.userId){
			return Chats.insert({user1Id:this.userId, user2Id:otherUserId});
		}
		else{
			return;
		}
	} // end addChat

})