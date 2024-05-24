const express = require("express");
const app = express();

// File Imports

const adminRouter = require("./admin");
const mainRouter = require("./main");
const playerRouter = require("./player");
const teamRouter = require("./team");
const teamPlayerRouter = require("./teamPlayer");

// Middleware
app.use(express.json());
app.use("/admin", adminRouter);
app.use("/main", mainRouter);
app.use("/player", playerRouter);
app.use("/team", teamRouter);
app.use("/teamPlayer", teamPlayerRouter);

app.listen(3001, () => {
  console.log("Server is Running in the port 3001");
});

module.exports = app;
