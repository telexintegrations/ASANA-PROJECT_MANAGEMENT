// Import required modules
const cron = require("node-cron");
const axios = require("axios");
require("dotenv").config();

// Load URLs and necessary values from environment variables for flexibility
const { INTEGRATION_URL, TICK_URL, TELEX_CHANNEL_ID, TELEX_RETURN_URL, CRON_FALLBACK_INTERVAL } = process.env;

async function fetchInterval() {
    try {
        // Fetch integration settings from the live server
        const response = await axios.get(INTEGRATION_URL);

        // Extract the interval value from the settings
        const interval = response.data.data.settings.find(setting => setting.label === 'interval').default;

        // Log the fetched interval for debugging
        console.log(`Fetched interval: ${interval}`);

        return interval;
    } catch (error) {
        // Log error if fetching the interval fails
        console.error("Failed to fetch interval:", error.message);

        // Return a fallback interval in case of failure
        return CRON_FALLBACK_INTERVAL || "*/9 * * * *";  // Default to */9 * * * * if nothing is provided
    }
}

async function startCronJob() {
    const interval = await fetchInterval();  // Get the interval to run the cron job

    // Log the interval for debugging purposes
    console.log(`Cron job will run with interval: ${interval}`);

    // Schedule the cron job to run at the fetched interval
    cron.schedule(interval, async () => {
        console.log("Running Asana sync job...");

        try {
            // Prepare the payload with the required details
            const payload = {
                channel_id: TELEX_CHANNEL_ID,  // Telex channel ID
                return_url: TELEX_RETURN_URL,  // The return URL where Telex expects a response
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
