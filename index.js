const express = require("express");
const app = express();

// File Imports

const adminRouter = require("./api/admin");
const mainRouter = require("./api/main");
const playerRouter = require("./api/player");
const teamRouter = require("./api/team");
const teamPlayerRouter = require("./api/teamPlayer");

// Middleware
app.use("/admin", adminRouter);
app.use("/main", mainRouter);
app.use("/player", playerRouter);
app.use("/team", teamRouter);
app.use("/teamPlayer", teamPlayerRouter);

const server = app.listen("3001", () => {
  console.log("Server is Running in the port 3001");
});

module.exports = { app, server };
