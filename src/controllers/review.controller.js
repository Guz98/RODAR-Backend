const {
  createReview,
  getReviewsByWorkshop,
  getMyReview,
  updateReview,
  deleteReview,
} = require("../models/repositories/review.repository");

// Ciclista deja una reseña en un taller
const postReviewController = async (req, res) => {
  const { workshopId } = req.params;
  try {
    const review = await createReview(req.user.id, workshopId, req.body);
    res.status(201).json(review);
  } catch (error) {
    // El índice único devuelve error si ya dejó una reseña en ese taller
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Ya dejaste una reseña en este taller" });
    }
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// Ver todas las reseñas de un taller
const getReviewsController = async (req, res) => {
  try {
    const reviews = await getReviewsByWorkshop(req.params.workshopId);
    res.status(200).json(reviews);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// Ver mi reseña en un taller específico
const getMyReviewController = async (req, res) => {
  try {
    const review = await getMyReview(req.user.id, req.params.workshopId);
    if (!review)
      return res
        .status(404)
        .json({ message: "No tenés una reseña en este taller" });
    res.status(200).json(review);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// Editar mi reseña
const putReviewController = async (req, res) => {
  try {
    const review = await updateReview(
      req.params.reviewId,
      req.user.id,
      req.body,
    );
    if (!review)
      return res.status(404).json({ message: "Reseña no encontrada" });
    res.status(200).json(review);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// Eliminar mi reseña
const deleteReviewController = async (req, res) => {
  try {
    await deleteReview(req.params.reviewId, req.user.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

module.exports = {
  postReviewController,
  getReviewsController,
  getMyReviewController,
  putReviewController,
  deleteReviewController,
};
