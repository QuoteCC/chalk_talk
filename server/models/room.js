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


// UserSchema.statics.findByCredentials = function (email, password){
//   var User = this;
//
//   return User.findOne({email}).then( (user) => {
//     if(!user){
//       return Promise.reject();
//     }
//     return new Promise( (resolve, reject) => {
//       bcrypt.compare(password, user.password, (err, res) => {
//         if(res){
//           resolve(user);
//         }else{
//           reject();
//         }
//       });
//     } )
//   });


RoomSchema.methods.getMessageByRoomId = function(id, mId){
  const Room = this;
  var curRoom = Room.findOne({id});
  curRoom.messages.forEach((message) => {
    if (message.mId == mId){
      return message;
    }

  });
  console.log("This shouldn't happen");

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
