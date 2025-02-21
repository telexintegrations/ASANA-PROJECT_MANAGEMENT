const cron = require("node-cron");
const axios = require("axios");

const tickUrl = "https://asana-project-management.onrender.com/tick";

// Run the job every 9 minutes
cron.schedule("*/9 * * * *", async () => {
    console.log("Running Asana sync job...");
    try {
        const response = await axios.post(tickUrl);
        console.log("Asana sync response:", response.data);
    } catch (error) {
        if (error.response) {
            console.error("Asana sync failed:", error.response.status, error.response.data);
        } else {
            console.error("Asana sync failed:", error.message);
        }
    }
});
