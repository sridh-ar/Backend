const { Router } = require("express");
const mainRouter = Router();
const { db } = require("../utils/database.js");

//Logging function
function _log(message) {
  console.log(`[Main_API] - `, message);
}

mainRouter.get("/", async (req, res) => {
  try {
    const result = await db.manyOrNone(`
        select config_name, config_value from config
        union
        select 'totalRegisteredPlayers', count(*) from player
        union
        select 
            'remainingSlots', 
            count(*) - (select config_value::int from config where config_name = 'allowedPlayersCount' ) 
        from player
    `);
    res.status(200).json(result);
  } catch (error) {
    _log(error.stack);
    res.status(500).json(error.message);
  }
});

module.exports = mainRouter;
