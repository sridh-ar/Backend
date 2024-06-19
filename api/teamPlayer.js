const { Router } = require("express");
const teamPlayerRouter = Router();
const { db, pgpHelpers } = require("../utils/database.js");

// Logging function
function _log(message) {
  console.log(`[TeamPlayer_API] - `, message);
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
async function insertTeamPlayer(data) {
  const existingData = await db.oneOrNone(`select 1 from team_players where player_no = '${data.player_no}'`);
  if(existingData){
    throw new Error("Player already part of an other team")
  }
  else{
    const createdId = await db.oneOrNone(
      pgpHelpers.insert(data, null, { table: "team_players" }) + " returning id"
    );
    if(createdId){
      await db.query(`UPDATE team SET remaining_slots = remaining_slots - 1, 
        remaining_points_available = remaining_points_available - ${parseInt(data.points)} 
        WHERE id = ${data.team_id}`);
    }
  }
  return true;
}

async function updateTeamPlayer(data) {
  return await db.oneOrNone(
    pgpHelpers.update(data, null, { table: "team_players" }) + " returning id"
  );
}

async function deleteTeamPlayerById(id) {
  return await db.oneOrNone(`delete from team_players where id = '${id}'`);
}

async function getAllTeamPlayer() {
  return await db.manyOrNone(`select * from team_players`);
}

async function getTeamPlayerForTeam(team_id) {
  return await db.manyOrNone(`
    select pl.id,pl.name, contact_number,jersey_name,jersey_size,jersey_no,t.team_name, t.owner from player pl 
    join team_players tp on tp.player_no = pl.id
    join team t on t.id = tp.team_id
    where tp.team_id = '${team_id}'
  `);
}

// Routes
teamPlayerRouter.post("/create", handleAsync(async (req, res) => {
    const data = req.body;
    const result = await insertTeamPlayer(data);
    res.status(200).json(result);
  })
);

teamPlayerRouter.put("/update/:id", handleAsync(async (req, res) => {
    const data = req.body;
    let selectResult = await getAllTeamPlayer();
    Object.assign(selectResult, data);
    const result = await updatePlayer(data);
    res.status(200).json(result);
  })
);

teamPlayerRouter.put("/delete/:id", handleAsync(async (req, res) => {
    const result = await deleteTeamPlayerById(req.params.id);
    res.status(200).json(result);
  })
);

teamPlayerRouter.get("/", handleAsync(async (req, res) => {
    const result = await getAllTeamPlayer();
    res.status(200).json(result);
  })
);

teamPlayerRouter.get("/team-players-list/:id", handleAsync(async (req, res) => {
    const result = await getTeamPlayerForTeam(req.params.id);
    res.status(200).json(result);
  })
);

module.exports = teamPlayerRouter;
