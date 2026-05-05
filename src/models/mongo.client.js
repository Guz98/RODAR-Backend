const mongoose = require("mongoose");

const connectMongoDB = async () => {
    const MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING;
    const MONGODB_DATABASE_NAME = process.env.MONGODB_DATABASE_NAME;
    await mongoose.connect(MONGODB_CONNECTION_STRING, {
        serverSelectionTimeoutMS: 3000,
        dbName: MONGODB_DATABASE_NAME,
    });
    console.log("Conexión a MongoDB establecida correctamente");
};

module.exports = connectMongoDB;
