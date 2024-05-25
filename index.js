require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./database/connection");
const app = express();

// Routes
const hack = require("./routes/hack");

// Env Variables
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// routers
app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

app.get("/api/v1/hello-world", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});
app.use("/api/v1", hack);

// Server
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
