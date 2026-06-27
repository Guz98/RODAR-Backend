const jwt = require("jsonwebtoken");
const {
  findUserByUsername,
  isValidPassword,
  saveUser,
} = require("../models/repositories/user.repository");

const postAuthLogin = async (req, res) => {
  const { username, password } = req.body;

  const user = await findUserByUsername(username);
  if (!user) {
    return res.status(400).json({ message: "Credenciales inválidas" });
  }

  const valid = await isValidPassword(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.AUTH_SECRET_KEY,
    { expiresIn: "1h" },
  );

  res.json({ token });
};

const postAuthSignup = async (req, res) => {
  const { name, username, password, email, role } = req.body;

  const existing = await findUserByUsername(username);
  if (existing) {
    return res.status(400).json({ message: "Nombre de usuario ya en uso" });
  }

  try {
    await saveUser(name, username, password, email, role);
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Ha ocurrido un error inesperado" });
  }
};

module.exports = { postAuthLogin, postAuthSignup };
