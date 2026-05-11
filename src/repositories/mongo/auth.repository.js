const User = require("../../models/User.model");

const findUserByEmail = (email) => {
  return User.findOne({ email });
};

const createUser = ({ name, email, password }) => {
  const user = new User({ name, email, password });
  return user.save();
};

module.exports = {
  findUserByEmail,
  createUser,
};
