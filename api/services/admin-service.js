const { db, pgpHelpers } = require("../../utils/database");

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
    select 'totalTeams', count(*)::text from team
    union
    select 'totalTeamPlayers', count(*)::text from team_players
`);
}

async function getAllConfig() {
return await db.manyOrNone(`select config_name,config_value from config`);
}

async function getOneConfig(config_name) {
return await db.oneOrNone(`select config_name,config_value from config where config_name = '${config_name}'`);
}

async function resetIds(){
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

async function resetApplication(){
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
  
module.exports = {
    insertConfig, 
    updateConfig,
    deleteConfig,
    getDashBoardConfig,
    getAllConfig,
    getOneConfig,
    resetIds,
    resetApplication
}