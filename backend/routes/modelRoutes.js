const express = require("express");
const router = express.Router();

const generateModelCode = require("../services/codeGenerator");
const protect = require("../middleware/authMiddleware.js");
const { saveModelRun, getMyModels } = require("../controller/modelController.js");


// save model after training
router.post("/save", protect, saveModelRun);

// get only logged user models
router.get("/my-models", protect, getMyModels);


router.post("/generate-code", protect, async (req,res)=>{
  try{
    const code = await generateModelCode(req.body);
    res.json({code});
  }catch(err){
    res.status(500).json({message:"Error generating code"});
  }
});



module.exports = router;
