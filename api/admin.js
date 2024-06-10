const { Router } = require("express");
const adminRouter = Router();
const { handleAsync } = require("./services/common-service.js");
const { insertConfig, updateConfig, deleteConfig, getAllConfig, 
  getDashBoardConfig, resetIds, resetApplication, getOneConfig} = require("./services/admin-service.js");

// Routes - /admin
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

adminRouter.get("/resetapplication", handleAsync(async (req, res) => {
    const result = await resetApplication();
    res.status(200).json(result);
  })
);

module.exports = adminRouter;
