const { findUserById } = require("../models/repositories/user.repository");

const getMeController = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.status(200).json(user);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const putMeController = async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true },
    ).select("-password");
    res.status(200).json(user);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

module.exports = { getMeController, putMeController };
