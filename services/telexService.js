// Import axios
const axios = require("axios");

// Import getProjectAndTasks (already implemented elsewhere)
const { getProjectAndTasks } = require("../controllers/projectController");

// Retrieve the webhook url from environment variables
const webHookUrl = process.env.WEBHOOK_URL;

// Function: process tick request and send Asana data to Telex
const processTick = async (req, res, next) => {
    try {
        console.log("Received tick request. Fetching Asana projects and tasks...");

        // Fetch Asana project & tasks (using the updated function that returns data)
        const asanaData = await getProjectAndTasks(req, res, next);

        // Check if the data is valid
        if (!asanaData || !asanaData.project) {
            console.error("No project data found.");
            return res.status(500).json({ error: "No project data found" });
        }

        // Log the fetched data for debugging
        console.log("Fetched Asana Data:", JSON.stringify(asanaData, null, 2));

        // Construct the formatted message for Telex
        const { project, tasks } = asanaData;

        // Format the task list for Telex message
        const tasksList = tasks.map(task => `- ${task.taskName} (Task ID: ${task.taskId})`).join("\n");

        // Construct detailed project information
        const message = `
        *Project Name:* ${project.projectName}
        *Project ID:* ${project.projectId}
        *Owner:* ${project.owner}
        *Team:* ${project.team}
        *Workspace:* ${project.workspace}
        *Status:* ${project.status.join(", ")}
        *Priority:* ${project.priority.join(", ")}
        *Due Date:* ${project.dueDate}
        *Archived:* ${project.archived ? "Yes" : "No"}
        *Completed:* ${project.completed ? "Yes" : "No"}
        *Permalink:* [Click here to view project](${project.permalinkUrl})
        *Last Modified:* ${project.lastModifiedAt}
        
        *Project Members:*
        ${project.members.join("\n")}
        
        *Project Followers:*
        ${project.followers.join("\n")}
        
        *Tasks Overview:*
        Completed: ${project.tasksOverview.completedTasks.length}
        Pending: ${project.tasksOverview.pendingTasks.length}
        Due: ${project.tasksOverview.dueTasks.length}

        *Task List:*
        ${tasksList}
        `;

        // Ensure the correct Telex webhook URL format
        const telexWebhookUrl = webHookUrl;

        // Payload for Telex (Remove `data`)
        const payload = {
            event_name: "Asana Task Update",
            message: message,  // The formatted message
            status: "success",
            username: "AsanaBot"
        };

        // Send POST request to Telex webhook
        const telexResponse = await axios.post(telexWebhookUrl, payload);
        console.log("Successfully sent notification to Telex:", telexResponse.data);

        // Ensure response is only sent once
        if (!res.headersSent) {
            res.status(200).json({ message: "Tick processed & notification sent successfully" });
        }

    } catch (error) {
        console.error("Tick processing failed:", error.response ? error.response.data : error.message);

        // Ensure we don't send duplicate responses
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to process tick" });
        }
    }
};

// Export function
module.exports = { processTick };