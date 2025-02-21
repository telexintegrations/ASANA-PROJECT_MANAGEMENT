// Import getProjectAndTasks from projectController
const { getProjectAndTasks } = require("../controllers/projectController");

const integrationJson = (req, res) => {
    const appData = {
      data: {
        date: {
          created_at: "2025-02-21",
          updated_at: "2025-02-21",
        },
        descriptions: {
          app_description: "Keep track on projects hosted on Asana",
          app_logo: "https://iili.io/Jcshqe2.webp",
          app_name: "Asana Project Management",
          app_url: "https://asana-project-management.onrender.com/asana-integration",
          background_color: "#HEXCODE",
        },
        integration_category: "Project Management",
        integration_type: "interval",
        is_active: true,
        key_features: [
            "Live Asana project monitoring",
            "Delivers updates straight to Telex channels",
            "Enables creation and updates of issues",
            "Configurable settings for event filtering"
        ],
        "author": "Christian Chibuzor Chibuike",
        settings: [
          {
            label: "interval",
            type: "text",
            required: true,
            default: "*/9 * * * *",
          },
          {
            label: "Do you want to continue",
            type: "checkbox",
            required: true,
            default: "Yes",
          },
        ],
        tick_url: "https://asana-project-management.onrender.com/tick",
        target_url: "https://asana-project-management.onrender.com",
      },
    };
  
    // Send the data as a response
    res.json(appData);
};

// Function: process tick request and fetch Asana data
const processTick = async (req, res, next) => {
    try {
        console.log("Received tick request. Fetching Asana projects and tasks...");

        // Call function to fetch and return project & task details
        await getProjectAndTasks(req, res, next);
        
        // Ensure response is only sent once
        if (!res.headersSent) {
            res.status(200).json({ message: "Tick processed successfully" });
        }

    } catch (error) {
        console.error("Tick processing failed:", error);
        res.status(500).json({ error: "Failed to process tick" });
    }
};

// Export both functions
module.exports = { integrationJson, processTick };