// Import axios
const axios = require("axios");
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
        console.log("Received tick request:", JSON.stringify(req.body, null, 2));

        const { channel_id, return_url, settings } = req.body;

        if (!return_url) {
            console.error("Missing return_url in request");
            return res.status(400).json({ error: "return_url is required" });
        }

        console.log(`Processing tick for channel: ${channel_id}`);
        console.log(`Return URL: ${return_url}`);

        // Fetch Asana project and tasks
        const asanaData = await getProjectAndTasks(req, res, next);

        // Construct response for Telex
        const responsePayload = {
            channelId: channel_id,
            message: "Telex project update successfully processed.",
            asanaData,
            timestamp: new Date().toISOString(),
        };

        // Send processed data back to Telex
        const telexResponse = await axios.post(return_url, responsePayload);
        console.log("Successfully sent response to Telex:", telexResponse.data);

        // Ensure response is only sent once
        if (!res.headersSent) {
            res.status(202).json({ message: "Tick processed successfully" });
        }

    } catch (error) {
        console.error("Tick processing failed:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to process tick" });
    }
};

// Export both functions
module.exports = { integrationJson, processTick };