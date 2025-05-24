const { Router } = require("express");
const gymRouter = Router();
const { handleAsync } = require("./services/common-service.js");
const { db, pgpHelpers } = require("../utils/database.js");

// Routes - /gym
gymRouter.get("/getTargetMuscles", handleAsync(async (req, res) => {
    // const data = req.body;
    const resut = await db.manyOrNone('select distinct target_muscle from gym.workouts')
    const resultArray = resut.map(item => item["target_muscle"])
    res.status(200).json(resultArray);
  })
);

gymRouter.get("/getWorkoutsForTargetMuscle", handleAsync(async (req, res) => {
    const targetMuscle = req.query.targetMuscle;
    if (!targetMuscle){
      return res.status(500).json('Param: targetMuscle is required')
    }
    const resut = await db.manyOrNone(`select id, title ,image_url from gym.workouts where target_muscle = '${targetMuscle}'`)
    res.status(200).json(resut);
  })
);


gymRouter.get("/getExerciseDetails", handleAsync(async (req, res) => {
    const exerciseId = req.query.exerciseId;
    if (!exerciseId){
      return res.status(500).json('Param: workoutId is required')
    }

    const query = `
      select 
        w.id, title ,image_url,date(ws.date)::text,ws.reps,ws.weight,row_number() over(partition by date(date) order by date) as set_num 
      from 
        gym.workouts w
      left join 
        gym.workout_sets ws on ws.workout_id = w.id
      where 
        w.id = ${exerciseId}
      order by 
        date(ws.date) desc
    `
    const resut = await db.manyOrNone(query)
    res.status(200).json(resut);
  })
);


gymRouter.post("/addNewWorkout", handleAsync(async (req, res) => {
    const body = req.body;

    const response = await db.oneOrNone(
      pgpHelpers.insert(body, null, { schema:"gym", table: "workouts" }) + " returning id"
    );
    res.status(200).json(response)
  })
);

gymRouter.post("/addWorkoutSet", handleAsync(async (req, res) => {
    const body = req.body;

    const response = await db.oneOrNone(
      pgpHelpers.insert(body, null, { schema:"gym", table: "workout_sets" }) + " returning id"
    );
    res.status(200).json(response)
  })
);

module.exports = gymRouter;
