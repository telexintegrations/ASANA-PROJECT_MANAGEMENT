// Import the express module
const express = require("express");
// Initialize a new router object for defining routes
const router = express.Router();
// Import the controller function to handle the project and task data retrieval
const { integrationJson } = require("../controllers/integrationController");

// Route for telex integration
router.route("/").get(integrationJson);

// Export router
module.exports = router;
