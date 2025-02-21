// Import the express module
const express = require("express");
// Initialize a new router object for defining routes
const router = express.Router();
// Import the controller function to handle the project and task data retrieval
const { getProjectAndTasks } = require("../controllers/projectController");
const { processTick } = require("../controllers/integrationController");

// Route to GET project and task details
router.route("/").get(getProjectAndTasks);

// Route for processing scheduled tick requests (Asana sync)
router.route("/tick").post(processTick);

// Export router
module.exports = router;
