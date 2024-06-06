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

async function resetIds(){
  try{
    let {config_value} = await db.oneOrNone(`select config_value from config where config_name = 'ResetIDTableNames'`)
    config_value = config_value?.split(',');
  
    config_value.map(async tableName =>{
      const {seq_name} = await db.oneOrNone(`
        SELECT substring(column_default FROM '''(.*)''::REGCLASS') AS seq_name from
        information_schema.columns where table_name = '${tableName}' and column_default is not NULL LIMIT 1`
      );
      if(seq_name){
        db.none(`
          ALTER SEQUENCE ${seq_name} RESTART;
          UPDATE ${tableName} SET id = DEFAULT;
        `)
      }
    })
    return true;
  }
  catch(error){
    console.log(`[Admin API][ResetIds] Error - `,error.message);
    throw new Error(error.message);
  }
}

async function resetApplication(){
  try{
    let {config_value} = await db.oneOrNone(`select config_value from config where config_name = 'ResetAppTableNames'`)
    config_value = config_value?.split(',');
  
    config_value.map(async tableName =>{
      const {seq_name} = await db.oneOrNone(`
        SELECT substring(column_default FROM '''(.*)''::REGCLASS') AS seq_name from
        information_schema.columns where table_name = '${tableName}' and column_default is not NULL LIMIT 1`
      );
      if(seq_name){
        db.none(`
          ALTER SEQUENCE ${seq_name} RESTART;
          TRUNCATE TABLE ${tableName};
        `)
      }
    })
    return true;
  }
  catch(error){
    console.log(`[Admin API][ResetApplication] Error - `,error.message);
    throw new Error(error.message);
  }  
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
    const result = await updateConfig(selectResult);
    res.status(200).json(result);
  })
);

adminRouter.put("/delete/:name", handleAsync(async (req, res) => {
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

adminRouter.get("/resetid", handleAsync(async (req, res) => {
    const result = await resetIds();
    res.status(200).json(result);
  })
);

adminRouter.post("/resetapplication", handleAsync(async (req, res) => {
    const result = await resetApplication();
    res.status(200).json(result);
  })
);

adminRouter.get("/getlogo", handleAsync(async (req, res) => {
    const result = await db.oneOrNone(`select data from images limit 1`);
    res.status(200).json(result);
  })
);

adminRouter.post("/uploadlogo", handleAsync(async (req, res) => {
  const result = await db.oneOrNone(`update images set data = $1 returning name`,[req.body.data]);
  res.status(200).json(result);
})
);

module.exports = adminRouter;