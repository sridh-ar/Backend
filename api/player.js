const { Router } = require("express");
const playerRouter = Router();
const { db, pgpHelpers } = require("../utils/database.js");

// Logging function
function _log(message) {
  console.log(`[Player_API] - `, message);
}

// Common error handling middleware
function handleAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      _log(error.stack);
      res.status(500).json({ message: error.message });
    });
  };
}

// Database operations
async function insertPlayer(data) {
  return await db.oneOrNone(
    pgpHelpers.insert(data, null, { table: "player" }) + " returning id"
  );
}

async function updatePlayer(data) {
  return await db.oneOrNone(
    pgpHelpers.update(data, null, { table: "player" }) + " returning id"
  );
}

async function deletePlayerById(id) {
  return await db.oneOrNone(`delete from player where id = '${id}'`);
}

async function getAllPlayers() {
  return await db.manyOrNone(`select * from player`);
}

// Routes
playerRouter.post(
  "/create",
  handleAsync(async (req, res) => {
    const data = req.body;
    const result = await insertPlayer(data);
    res.status(200).json(result);
  })
);

playerRouter.put(
  "/update/:id",
  handleAsync(async (req, res) => {
    const data = req.body;
    let selectResult = await getAllPlayers();
    Object.assign(selectResult, data);
    const result = await updatePlayer(data);
    res.status(200).json(result);
  })
);

playerRouter.put(
  "/delete/:id",
  handleAsync(async (req, res) => {
    const result = await deletePlayerById(req.params.id);
    res.status(200).json(result);
  })
);

playerRouter.get(
  "/",
  handleAsync(async (req, res) => {
    const result = await getAllPlayers();
    res.status(200).json(result);
  })
);

module.exports = playerRouter;
