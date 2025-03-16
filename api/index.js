const express = require("express");
const cors = require('cors');
const app = express();

// Middleware
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))
app.use(express.json({ limit: "50mb", extended: true, parameterLimit: 50000 }))
app.use(cors());

app.use("/admin", require("./admin"));
app.use("/main", require("./main"));
app.use("/player", require("./player"));
app.use("/team", require("./team"));
app.use("/teamPlayer", require("./teamPlayer"));
app.use("/auth", require("./auth"));
app.use("/payment", require("./payment"));

app.listen(3001, () => {
  console.log("Server is Running in the port 3001");
});

module.exports = app;
