const express = require('express');
const playerRouter = require('./api/players');
const uploadRouter = require('./api/upload');

const app = express();

// Middleware
app.use(express.json());
app.use('/api/players',playerRouter)
app.use('/api/upload',uploadRouter)

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


module.exports = { app, server }