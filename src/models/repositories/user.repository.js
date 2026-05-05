const { User } = require("../index");
const bcrypt = require("bcryptjs");

// Busca un usuario por su username — se usa en el login para verificar si existe
// Devuelve el documento completo incluyendo el password hasheado para poder compararlo
const findUserByUsername = async (username) => {
  return await User.findOne({ username });
};

// Busca un usuario por su id — se usa para obtener el perfil del usuario autenticado
// El -password excluye la contraseña hasheada de la respuesta por seguridad
const findUserById = async (id) => {
  return await User.findById(id).select("-password");
};

// Compara la contraseña ingresada con el hash guardado en MongoDB
// bcrypt.compare no desencripta — genera el hash de la contraseña ingresada
// y lo compara con el almacenado. Devuelve true si coinciden, false si no
const isValidPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Crea un nuevo usuario hasheando la contraseña antes de guardarla
// El 10 es el número de "salt rounds" — define cuántas veces se aplica el algoritmo
// Más rounds = más seguro pero más lento. 10 es el estándar recomendado
const saveUser = async (name, username, password, email, role) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    name,
    username,
    password: hashedPassword,
    email,
    role,
  });
  return await newUser.save();
};

module.exports = {
  findUserByUsername,
  findUserById,
  isValidPassword,
  saveUser,
};
