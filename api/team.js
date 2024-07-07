const { Router } = require("express");
const teamRouter = Router();
const { db, pgpHelpers } = require("../utils/database.js");

// Logging function
function _log(message) {
  console.log(`[Team_API] - `, message);
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
async function insertOrUpdateTeam(data) {
  if(data && data.id){
    let existingTeam = await db.oneOrNone(`select * from team where id = '${data.id}'`)
    Object.assign(existingTeam, data)
    return await db.oneOrNone(
      pgpHelpers.update(existingTeam, null, { table: "team" }) + " returning id"
    );
  }
  return await db.oneOrNone(
    pgpHelpers.insert(data, null, { table: "team" }) + " returning id"
  );
}

async function updateTeam(data) {
  return await db.oneOrNone(
    pgpHelpers.update(data, null, { table: "team" }) + " returning id"
  );
}

async function deleteTeamById(id) {
  return await db.oneOrNone(`delete from team where id = '${id}'`);
}

async function getAllTeam() {
  return await db.manyOrNone(`select * from team`);
}

// Routes
teamRouter.post("/createorupdate", handleAsync(async (req, res) => {
    const data = req.body;
    const result = await insertOrUpdateTeam(data);
    res.status(200).json(result);
  })
);

teamRouter.put(
  "/update/:id",
  handleAsync(async (req, res) => {
    const data = req.body;
    let selectResult = await getAllTeam();
    Object.assign(selectResult, data);
    const result = await updatePlayer(data);
    res.status(200).json(result);
  })
);

teamRouter.put(
  "/delete/:id",
  handleAsync(async (req, res) => {
    const result = await deleteTeamById(req.params.id);
    res.status(200).json(result);
  })
);

teamRouter.get(
  "/",
  handleAsync(async (req, res) => {
    const result = await getAllTeam();
    res.status(200).json(result);
  })
);

module.exports = teamRouter;
