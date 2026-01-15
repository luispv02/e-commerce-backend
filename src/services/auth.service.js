const generateJWT = require("../helpers/generate-jwt.helper");
const User = require("../models/User.model");
const bcrypt = require('bcrypt');
const CustomError = require("../utils/custom-error.util");

const registerUser = async({ name, email, password }) => {

  const user = await User.findOne({ email });
  if (user) throw new CustomError("Usuario ya registrado", 400);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();

  const token = await generateJWT({
    uid: newUser.id,
    name: newUser.name,
    role: newUser.role,
  });

  return {
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
    token,
  };
};

const loginUser = async({ email, password }) => {

  const user = await User.findOne({ email });
  if (!user) throw new CustomError("Credenciales inválidas", 400);

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new CustomError("Credenciales inválidas", 400);

  const token = await generateJWT({ uid: user.id, name: user.name, role: user.role });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

const renewToken = async({ uid, name, role }) => {
  if (!uid || !name || !role) throw new CustomError("Datos no válidos", 400);

  const token = await generateJWT({ uid, name, role });

  return {
    user: {
      id: uid,
      name,
      role,
    },
    token,
  };
};

module.exports = {
    registerUser,
    loginUser,
    renewToken
}