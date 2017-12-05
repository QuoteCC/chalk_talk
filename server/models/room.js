const mongoose = require('mongoose');
const _ = require('lodash');

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    minLengh: 1,
    maxlength: 45,
    trim: true
  },
  messages: [{
    from: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minLengh: 1
    },
    createdAt: {
      type: Number,
      required: true
    },
    url: {
      type: Boolean
    },
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId
    }],
    mId :{
      type: Number
    }

  }],
  users:[{
    name: String
  }]

});

RoomSchema.methods.addMessage = function(message){

  this.messages.push(message);

  return this.save().then( () => message );
};

RoomSchema.methods.getUsers = function(){
  return this.users;
}

RoomSchema.methods.getMessages = function(){
  return this.messages;
}

RoomSchema.methods.addUser = function(user){
  this.users.push(user);

  return this.save().then( (roomDoc) => roomDoc );
}

RoomSchema.methods.removeUser = function(id){
  return this.update({
    $pull: {
      users: {
        _id: id
      }
    }
  });
}

RoomSchema.statics.getMessageByRoomId = function(mId, room_id, user_id){
  const Room = this;
  //console.log("Room Id", room_id);
  return Room.findById(room_id).then((curRoom) => {
    //console.log("cur room", curRoom);

    //mid is the middle man
    var mid = curRoom.messages;
    //mid[mId].text = "updated?";

    var found = false;
    mid[mId].upvotes.forEach(function(uId, index){
      if (uId == user_id){
        //console.log("found the user, removing");
        mid[mId].upvotes.splice(index, 1);
        found = true;
        //break;
      }
    });
    if (!found){
      //console.log("not found, added");
      mid[mId].upvotes.push(user_id);
    }
    //console.log("upvote Length", mid[mId].upvotes);




    //this is the query
    var test = Room.findByIdAndUpdate(room_id, {messages: mid});

    //execute the query
    test.exec();
    //console.log("len right before send", mid[mId].upvotes.length)
    //return mid[mId].upvotes.length;
    var p =  new Promise ( function(resolve, reject) {
      resolve(mid[mId].upvotes.length)
    });
    //console.log("promise", p);
    return p;

  });

};



RoomSchema.statics.getQuestions = function (){
  const Room = this;

  var msgList = [];

  return Room.find({}).then( (rooms) => {
    rooms.forEach((room, index) => {
      room.messages.some((msg) => {
        msgList.push({
          text: msg.text,
          score: msg.upvotes.length});
      });
    });
    return new Promise (resolve => resolve(msgList));
  });

}

RoomSchema.statics.getRoomList = function (){
  const Room = this;

  return Room.find({}).then( (rooms) => {
    let roomList = [];
    rooms.forEach( (room) =>{
      roomList[rooms.indexOf(room)] = room.name ;
    });
    return new Promise ( resolve => resolve(roomList) );
  });

};

RoomSchema.statics.cleanAllUserList = function (){
  const Room = this;

  return Room.find({}).then( (rooms) => {

    const fn = function updateValue(r){
      r.set({ users: [] });
      r.save();
    }

    const actions = rooms.map(fn);
    return Promise.all(actions);

  });

};

const Room = mongoose.model('Room', RoomSchema);

module.exports = {Room};
