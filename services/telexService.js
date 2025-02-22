// Import required modules
const axios = require("axios");
const { getProjectAndTasks } = require("../controllers/projectController");

// Function: Process tick request and send Asana data to Telex
const processTick = async (req, res, next) => {
    try {
        console.log("Received tick request. Fetching Asana projects and tasks...");

        // Extract the return_url dynamically from Telex's request
        const { return_url } = req.body;

        if (!return_url) {
            console.error("No return_url received from Telex.");
            return res.status(400).json({ error: "No return_url provided by Telex" });
        }

        // Fetch Asana project & tasks
        const asanaData = await getProjectAndTasks(req, res, next);

        if (!asanaData || !asanaData.project) {
            console.error("No project data found.");
            return res.status(500).json({ error: "No project data found" });
        }

        console.log("Fetched Asana Data:", JSON.stringify(asanaData, null, 2));

        // Extract project and tasks
        const { project, tasks } = asanaData;

        // Format the task list
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
        *Permalink:* [View Project](${project.permalinkUrl})
        *Last Modified:* ${project.lastModifiedAt}

        *Project Members:*
        ${project.members.join("\n")}

        *Project Followers:*
        ${project.followers.join("\n")}

        *Tasks Overview:*
        ✅ Completed: ${project.tasksOverview.completedTasks.length}
        ⏳ Pending: ${project.tasksOverview.pendingTasks.length}
        📅 Due: ${project.tasksOverview.dueTasks.length}

        *Task List:*
        ${tasksList}
        `;

        // Payload for Telex (sending response to return_url)
        const payload = {
            event_name: "Asana Task Update",
            message: message,
            status: "success",
            username: "AsanaBot"
        };

        // Send response back to the return_url provided by Telex
        await axios.post(return_url, payload);
        console.log("Successfully sent response to Telex return_url:", return_url);

        // Ensure response is only sent once
        if (!res.headersSent) {
            res.status(200).json({ message: "Tick processed & response sent to Telex" });
        }

    } catch (error) {
        console.error("Tick processing failed:", error.response ? error.response.data : error.message);

        // Ensure we don't send duplicate responses
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to process tick" });
        }
    }
};

// Export the function
module.exports = { processTick };
