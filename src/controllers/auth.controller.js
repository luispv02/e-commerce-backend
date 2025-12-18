const generateJWT = require("../helpers/generate-jwt.helper");
const User = require("../models/User.model");
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        ok: false,
        msg: 'Usuario ya registrado'
      })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = await generateJWT({ uid: newUser.id, name: newUser.name, role: newUser.role })

    return res.status(201).json({
      ok: true,
      msg: 'Usuario registrado',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        token
      }
    })
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: 'Error al registrar usuario'
    })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        ok: false,
        msg: 'Credenciales invalidas'
      })
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        ok: false,
        msg: 'Credenciales invalidas'
      })
    };

    const token = await generateJWT({ uid: user.id, name: user.name, role: user.role })

    return res.status(200).json({
      ok: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token
      }
    })

  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: 'Error al iniciar sesión'
    })
  }
}

const renewToken = async (req, res) => {
  try {

    const { uid, name, role } = req.user;
    if (!uid || !name || !role) {
      return res.status(400).json({
        ok: false,
        msg: 'Datos no validos'
      });
    }

    const token = await generateJWT({ uid, name, role });

    return res.status(200).json({
      ok: true,
      msg: 'Token renovado',
      data: {
        user: {
          id: uid,
          name: name,
          role: role,
        },
        token
      }
    })

  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: 'Error al renovar token'
    })
  }
}

module.exports = {
  registerUser,
  loginUser,
  renewToken
}