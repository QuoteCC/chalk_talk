const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');


//user shema variable stores schema for user - store all attributes - makes code more flexible - can add methods!!!

//----------------------
// User has an: EMAIL, NAME, PASSWORD, TOKENS (authentication)
//----------------------

var UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    required: true,
    trim: true,
    type: String,
    minLengh: 1,
    unique: true,
    validate: {
      //use validator to check if email is true or not - simplifies and makes us not have to check edge cases and what not
      validator: (value) =>{
        return validator.isEmail(value);
      },
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minLengh: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

//jwt.sign - creates hash and returns token value
//jwt.verify() - takes token and makes sure data was not manipulated - decodes essentially


//instance method - does have access to doc
//don't use arrow function because 'this' is not binded

//model methods are called User object - require doc - findByToken - CUSTOM - take JWT token and find individual user and return user

//instance methods called on user instance - 1 user - generateAuthToken - adding token on to individual user token - REQUIRES token

//Models are defined by passing a Schema instance to mongoose.model

UserSchema.methods.toJSON = function () {
  let user = this;
  let userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email', 'name']);
};

UserSchema.methods.generateAuthToken = function (){
  let user = this;
  let access = 'auth';
  let token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

  user.tokens.push({access, token});

  return user.save().then( () => {
    return token;
  } );
};

UserSchema.methods.removeToken = function (token){
  let user = this;

  return user.update({
    //The $pull operator removes from an existing array all instances of a value or values that match a specified condition
    $pull: {
      tokens: {token}
    }
  });
};

UserSchema.statics.findByToken = function (token){
  var User = this;
  var decoded;

  try{
    console.log("Token:", token);
    console.log('Secret:', process.env.JWT_SECRET);
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch(e) {
    console.log('error: ', e.message);
    //return a new promise - will get returned in server as rejected
    return Promise.reject();
  }
  //.findOne - Returns one document that satisfies the specified query criteria on the collection or view.
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });

};

UserSchema.statics.findByCredentials = function (email, password){
  var User = this;

  return User.findOne({email}).then( (user) => {
    if(!user){
      return Promise.reject();
    }
    return new Promise( (resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if(res){
          resolve(user);
        }else{
          reject();
        }
      });
    } )
  });


};

//pre save is a hook that fires on instances when their save method is called, not on the model when update is called.
UserSchema.pre('save', function (next){
  var user = this;

  if(user.isModified('password')){
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });

  }else{
    next();
  }
});

//Models are defined by passing a Schema instance to mongoose.model
var User = mongoose.model('User', UserSchema);

module.exports = {User};
