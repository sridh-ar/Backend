const express = require('express');
const playerRouter = express.Router();
const { db } = require('../lib/database');

const getAllPlayers = async (req, res) => {
    console.log("[getAllPlayers] Api Reached")

    const query = `select * from player ${req.params.id ? ` where id = ${req.params.id}` : ''}`;
    try{
        const playersData = await db.manyOrNone(query) || [];
        return res.status(200).json(playersData);
    }
    catch(error){
        const result = {
            error,
            message: error.message
        }
        return res.status(401).json(result);
    }
}

const createPlayer = async (req, res) => {
    console.log("[createPlayer] Api Reached")
    try{
        const playersData = await db.manyOrNone(`select * from player`) || [];
        return res.status(200).json(playersData);
    }
    catch(error){
        const result = {
            error,
            message: error.message
        }
        return res.status(401).json(result);
    }
}
const updatePlayer = async (req, res) => {
    console.log("[getAllPlayers] Api Reached")
    try{
        const playersData = await db.manyOrNone(`select * from player`) || [];
        return res.status(200).json(playersData);
    }
    catch(error){
        const result = {
            error,
            message: error.message
        }
        return res.status(401).json(result);
    }
}
const deletePlayer = async (req, res) => {
    console.log("[deletePlayer] Api Reached")
    try{
        const playersData = await db.manyOrNone(`delete from player where id = ${req.params.id} returning *`) || [];
        return res.status(200).json(playersData);
    }
    catch(error){
        const result = {
            error,
            message: error.message
        }
        return res.status(401).json(result);
    }
}


playerRouter.get('/',getAllPlayers);
playerRouter.get('/create',createPlayer);
playerRouter.get('/update/:id',updatePlayer);
playerRouter.get('/delete/:id',deletePlayer);
playerRouter.get('/:id',getAllPlayers);

playerRouter.get('/aa',(req,res) =>{
    req.params.id
})

module.exports = playerRouter;