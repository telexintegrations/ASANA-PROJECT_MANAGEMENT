// Import the express module
const express = require("express");
// Initialize a new router object for defining routes
const router = express.Router();
// Import the controller function to handle the project and task data retrieval
const { getProjectAndTasks } = require("../controllers/projectController");

// Route to GET project and task details
router.route("/").get(getProjectAndTasks);

// Export router
module.exports = router;
