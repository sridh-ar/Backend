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
// async function insertTeamPlayer(data) {
//   const existingData = await db.oneOrNone(`select 1 from team_players where player_no = '${data.player_no}'`);
//   if(existingData){
//     throw new Error("Player already part of an other team")
//   }
//   else{
//     const createdId = await db.oneOrNone(
//       pgpHelpers.insert(data, null, { table: "team_players" }) + " returning id"
//     );
//     if(createdId){
//       await db.query(`UPDATE team SET remaining_slots = remaining_slots - 1, 
//         remaining_points_available = remaining_points_available - ${parseInt(data.points)} 
//         WHERE id = ${data.team_id}`);
//     }
//   }
//   return true;
// }
async function insertTeamPlayer(data) {
  // Check if player is already in a team
  const existingData = await db.oneOrNone(`
    SELECT 1 FROM team_players WHERE player_no = '${data.player_no}'
  `);

  if (existingData) {
    throw new Error("Player already part of another team");
  }

  // Get current team's remaining slots and points
  const teamData = await db.oneOrNone(`
    SELECT remaining_slots, remaining_points_available 
    FROM team 
    WHERE id = ${data.team_id}
  `);

  if (!teamData) {
    throw new Error("Team not found");
  }

  const { remaining_slots, remaining_points_available } = teamData;
  const currentPlayerPoints = parseInt(data.points);
  const basePoint = 100;

  // Check if current player exceeds points
  if (currentPlayerPoints > remaining_points_available) {
    throw new Error("Not enough points available for this player");
  }

  // Check if picking this player leaves enough points for remaining slots
  const pointsLeftAfterThisPlayer = remaining_points_available - currentPlayerPoints;
  const minRequiredPointsForOthers = (remaining_slots - 1) * basePoint;

  if (pointsLeftAfterThisPlayer <= minRequiredPointsForOthers) {
    throw new Error(`You won't have enough points to pick ${remaining_slots - 1} more player(s). Minimum required points: ${minRequiredPointsForOthers}`);
  }

  // Insert player
  const createdId = await db.oneOrNone(
    pgpHelpers.insert(data, null, { table: "team_players" }) + " returning id"
  );

  // Update team only if insert was successful
  if (createdId) {
    await db.query(`
      UPDATE team 
      SET remaining_slots = remaining_slots - 1, 
          remaining_points_available = remaining_points_available - ${currentPlayerPoints} 
      WHERE id = ${data.team_id}
    `);
  }

  return true;
}


async function updateTeamPlayer(data) {
  return await db.oneOrNone(
    pgpHelpers.update(data, null, { table: "team_players" }) + " returning id"
  );
}

async function deleteTeamPlayerById(playerId) {
  const deletedPlayer = await db.oneOrNone(`select points, team_id from team_players where player_no = '${playerId}'`)
  if (deletedPlayer) {
    return await db.query(`
      UPDATE team SET remaining_slots = remaining_slots + 1, 
      remaining_points_available = remaining_points_available + ${parseInt(deletedPlayer.points)} 
      WHERE id = ${deletedPlayer.team_id};

      delete from team_players where player_no = '${playerId}'
    `);
  }
}

async function getAllTeamPlayer() {
  return await db.manyOrNone(`select * from team_players`);
}

async function getTeamPlayerForTeam(team_id) {
  return await db.manyOrNone(`
    select pl.id,pl.name, contact_number,jersey_name,jersey_size,jersey_no,t.team_name, t.owner, t.id as team_id from player pl 
    join team_players tp on tp.player_no = pl.id
    join team t on t.id = tp.team_id
    where tp.team_id = '${team_id}'
  `);
}

async function getTeamPhoto(team_id) {
  return await db.manyOrNone(`
    select  distinct pl.name, pl.player_photo, 'player' type from player pl 
    join team_players tp on tp.player_no = pl.id
    where tp.team_id = '${team_id}'
    union
    select owner name, owner_photo player_photo, 'owner' type  from team where id = '${team_id}'
    union
    select captain name, captain_photo player_photo,'captain' type  from team where id = '${team_id}'
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

teamPlayerRouter.get("/team-photo-list/:id", handleAsync(async (req, res) => {
  const result = await getTeamPhoto(req.params.id);
  res.status(200).json(result);
})
);

module.exports = teamPlayerRouter;
