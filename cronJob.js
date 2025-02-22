// Import required modules
const cron = require("node-cron");
const axios = require("axios");
require("dotenv").config();

// Import integration settings from integrationController.js
const { integrationJson } = require("./controllers/integrationController");

// Load necessary values from environment variables
const { TICK_URL, CRON_FALLBACK_INTERVAL } = process.env;

async function fetchInterval() {
    try {
        // Get the settings directly from integrationJson
        const appData = integrationJson();

        // Extract the interval value
        const interval = appData.data.settings.find(setting => setting.label === 'interval').default;

        console.log(`Fetched interval: ${interval}`);
        return interval;
    } catch (error) {
        console.error("Failed to fetch interval:", error.message);
        return CRON_FALLBACK_INTERVAL || "*/9 * * * *";  
    }
}

async function startCronJob() {
    const interval = await fetchInterval(); // Get the interval to run the cron job

    console.log(`Cron job will run with interval: ${interval}`);

    // Schedule the cron job to run at the fetched interval
    cron.schedule(interval, async () => {
        console.log("Running Asana sync job...");

        try {
            // Prepare the payload with necessary settings
            const payload = {
                settings: [
                    {
                        label: "interval",
                        type: "text",
                        required: true,
                        default: interval,
                    },
                    {
                        label: "Do you want to continue",
                        type: "checkbox",
                        required: true,
                        default: "Yes",
                    },
                ],
            };

            // Trigger the tick URL to sync with Asana and send the payload
            const response = await axios.post(TICK_URL, payload);
            console.log("Asana sync response:", response.data);
        } catch (error) {
            if (error.response) {
                console.error("Asana sync failed:", error.response.status, error.response.data);
            } else {
                console.error("Asana sync failed:", error.message);
            }
        }
    });
}

// Start the cron job
startCronJob();
