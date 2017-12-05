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
  console.log("Room Id", room_id);
  Room.findOne({'_id':room_id}).then((curRoom) => {
    console.log("curr room", curRoom);
    var contains = false;
    var msg  = curRoom.messages.findOne({
      'mId': mId});
    msg.upvotes.findOne({user_id}).then( (user) => {
      if(!user){
        msg.upvotes.push(user_id);
      }
      else {
        msg.upvotes.findOneandRemove(user_id);
      }
      return new Promise ( resolve => resolve(msg.upvotes.length))
    });



  }).catch((e) => {
    console.log("empty room err", e);
    return Promise.reject();
  });
};

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
