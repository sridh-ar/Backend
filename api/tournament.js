const { Router } = require("express");
const tournamentRouter = Router();
const { db, pgpHelpers } = require("../utils/database.js");

// Logging function
function _log(message) {
  console.log(`[Tournament_API] - `, message);
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
async function insertOrUpdateTournament(data) {
  if(data && data.id){
    let existingPlayer = await db.oneOrNone(`select * from tournament where id = '${data.id}'`)
    Object.assign(existingPlayer, data)
    return await db.oneOrNone(
      pgpHelpers.update(existingPlayer, null, { table: "player" }) + ` where id = '${data.id}' returning id`
    );
  }
  
  return await db.oneOrNone(
    pgpHelpers.insert(data, null, { table: "tournament" }) + " returning id"
  );
}

async function updateTournament(data) {
  return await db.oneOrNone(
    pgpHelpers.update(data, null, { table: "tournament" }) + " returning id"
  );
}

async function deleteTournamentById(id) {
  return await db.oneOrNone(`delete from tournament where id = '${id}'`);
}

async function getAllTournaments() {
  return await db.manyOrNone(`select * from tournament`);
}

// Routes
tournamentRouter.post("/createorupdate", handleAsync(async (req, res) => {
    const data = req.body;
    const result = await insertOrUpdateTournament(data);
    res.status(200).json(result);
  })
);

tournamentRouter.put(
  "/update/:id",
  handleAsync(async (req, res) => {
    const data = req.body;
    let selectResult = await getAllTournaments();
    Object.assign(selectResult, data);
    const result = await updateTournament(data);
    res.status(200).json(result);
  })
);

tournamentRouter.put(
  "/delete/:id",
  handleAsync(async (req, res) => {
    const result = await deleteTournamentById(req.params.id);
    res.status(200).json(result);
  })
);

tournamentRouter.get(
  "/",
  handleAsync(async (req, res) => {
    const result = await getAllTournaments();
    res.status(200).json(result);
  })
);

module.exports = tournamentRouter;
