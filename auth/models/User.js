const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    maxLength: 254,
    minLength: 6,
  },

  username: {
    required: true,
    type: String,
    minLength: 6,
    maxLength: 48,
  },
  password: {
    required: true,
    type: String,
    minLength: 6,
    maxLength: 60,
  },
});

const User = new model("User", userSchema);

module.exports = User;
