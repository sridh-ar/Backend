const { Router } = require("express");
const adminRouter = Router();
const { db, pgpHelpers } = require("../utils/database.js");

// Logging function
function _log(message) {
  console.log(`[Admin_API] - `, message);
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
async function insertConfig(data) {
  return await db.oneOrNone(
    pgpHelpers.insert(data, null, { table: "config" }) + " returning *"
  );
}

async function updateConfig(data) {
  return await db.oneOrNone(
    pgpHelpers.update(data, null, { table: "config" }) + ` where config_name = '${data.config_name}'  returning *`
  );
}

async function deleteConfig(name) {
  return await db.oneOrNone(`delete from config where config_name = '${name}'`);
}

async function getDashBoardConfig() {
  return await db.manyOrNone(`
    select config_name,config_value from config
    union
    select 'totalRegisteredPlayers', count(*)::text from player
    union
    select 
        'remainingSlots',
        ((select config_value::int from config where config_name = 'allowedRegistrationCount') - count(*))::text
    from player;
`);
}

async function getAllConfig() {
  return await db.manyOrNone(`select config_name,config_value from config`);
}

async function getOneConfig(config_name) {
  return await db.oneOrNone(`select config_name,config_value from config where config_name = '${config_name}'`);
}

// Routes
adminRouter.post("/create", handleAsync(async (req, res) => {
    const data = req.body;
    const result = await insertConfig(data);
    res.status(200).json(result);
  })
);

adminRouter.put("/update/:name", handleAsync(async (req, res) => {
    const data = req.body;
    let selectResult = await getOneConfig(req.params.name);
    Object.assign(selectResult, data);
    console.log({selectResult});
    const result = await updateConfig(selectResult);
    res.status(200).json(result);
  })
);

adminRouter.put("/delete/:id", handleAsync(async (req, res) => {
    const result = await deleteConfig(req.params.name);
    res.status(200).json(result);
  })
);

adminRouter.get("/", handleAsync(async (req, res) => {
    const result = await getAllConfig();
    res.status(200).json(result);
  })
);

adminRouter.get("/dashboard", handleAsync(async (req, res) => {
    const result = await getDashBoardConfig();
    res.status(200).json(result);
  })
);

module.exports = adminRouter;