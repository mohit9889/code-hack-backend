const mongoose = require("mongoose");

const DB_URL = process.env.DB_URL;

const connection = async () => {
  try {
    mongoose.connect(DB_URL).then(() => console.log("Database connected!"));
  } catch (error) {
    console.log("Error while connection DB", error);
  }
};

connection();
