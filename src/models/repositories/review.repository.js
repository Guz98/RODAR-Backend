const { Review, Workshop } = require("../index");

// Crea una reseña y recalcula el promedio del taller automáticamente
const createReview = async (userId, workshopId, payload) => {
  const review = new Review({ userId, workshopId, ...payload });
  await review.save();

  // Recalcula el promedio del taller con todas sus reseñas
  const stats = await Review.aggregate([
    { $match: { workshopId: review.workshopId } },
    {
      $group: {
        _id: "$workshopId",
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Workshop.findByIdAndUpdate(workshopId, {
      "rating.average": parseFloat(stats[0].average.toFixed(1)),
      "rating.count": stats[0].count,
    });
  }

  return review;
};

// Ver todas las reseñas de un taller
const getReviewsByWorkshop = async (workshopId) => {
  return await Review.find({ workshopId })
    .populate("userId", "name username") // muestra quién dejó la reseña
    .select("rating comment createdAt");
};

// Ver la reseña que dejó el usuario en un taller específico
const getMyReview = async (userId, workshopId) => {
  return await Review.findOne({ userId, workshopId });
};

// Editar una reseña propia
const updateReview = async (reviewId, userId, payload) => {
  const review = await Review.findOne({ _id: reviewId, userId });
  if (review) {
    Object.entries(payload).forEach(([key, value]) => {
      review[key] = value;
    });
    await review.save();

    // Recalcula el promedio del taller
    const stats = await Review.aggregate([
      { $match: { workshopId: review.workshopId } },
      {
        $group: {
          _id: "$workshopId",
          average: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Workshop.findByIdAndUpdate(review.workshopId, {
        "rating.average": parseFloat(stats[0].average.toFixed(1)),
        "rating.count": stats[0].count,
      });
    }
  }
  return review;
};

// Eliminar una reseña propia
const deleteReview = async (reviewId, userId) => {
  const review = await Review.findOne({ _id: reviewId, userId });
  if (review) {
    const workshopId = review.workshopId;
    await review.deleteOne();

    // Recalcula el promedio sin esta reseña
    const stats = await Review.aggregate([
      { $match: { workshopId } },
      {
        $group: {
          _id: "$workshopId",
          average: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    await Workshop.findByIdAndUpdate(workshopId, {
      "rating.average":
        stats.length > 0 ? parseFloat(stats[0].average.toFixed(1)) : 0,
      "rating.count": stats.length > 0 ? stats[0].count : 0,
    });
  }
  return review;
};

module.exports = {
  createReview,
  getReviewsByWorkshop,
  getMyReview,
  updateReview,
  deleteReview,
};
