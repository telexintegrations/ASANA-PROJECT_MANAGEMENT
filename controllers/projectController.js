// Import necessary dependencies
const axios = require('axios');
// Import the constant function for error handling
const { constants } = require("../constants");
const { filterProjectDetails } = require("../utils/projectFilter");  // Import filter function

// Retrieve the project_gid and access token from environment variables
const projectGid = process.env.ASANA_PROJECT_ID;
const asanaAccessToken = process.env.ASANA_ACCESS_TOKEN;

// Base URL and headers for Asana API requests
const asanaApiUrl = "https://app.asana.com/api/1.0";
const headers = {
  'Authorization': `Bearer ${asanaAccessToken}`,
};

// Function to get project details
const getProjectDetails = async () => {
  try {
    const response = await axios.get(`${asanaApiUrl}/projects/${projectGid}`, { headers });
    return response.data.data;
  } catch (err) {
    console.error("Error fetching project details:", err);

    // Throwing custom error with constants for error handling
    throw {
      statusCode: constants.SERVER_ERROR,
      message: "Failed to fetch project details from Asana API"
    };
  }
};

// Function to get tasks for a project
const getTasksForProject = async () => {
  try {
    const response = await axios.get(`${asanaApiUrl}/projects/${projectGid}/tasks`, {
      headers,
      params: {
        opt_fields: 'gid,name,status,due_on,priority'
      }
    });
    return response.data.data;
  } catch (err) {
    console.error("Error fetching tasks:", err);

    // Throwing custom error with constants for error handling
    throw {
      statusCode: constants.SERVER_ERROR,
      message: "Failed to fetch tasks for the project from Asana API"
    };
  }
};

// Get project details and tasks, then filter and send response
const getProjectAndTasks = async (req) => {
  try {
    // Fetch project details
    const projectData = await getProjectDetails();
    
    // Fetch tasks for the project
    const tasksData = await getTasksForProject();
    
    // Filter the relevant details
    const filteredProjectDetails = filterProjectDetails(projectData, tasksData);
    
    // Format the response data
    return {
      project: filteredProjectDetails,
      tasks: tasksData.map(task => ({
        taskId: task.gid,
        taskName: task.name,
        resourceType: task.resource_type,
      })),
    };
  } catch (err) {
    console.error("Error fetching project and tasks:", err);
    
    // Return `null` or throw an error instead of modifying `res`
    return null;
  }
};


// Export the function to be used in the router
module.exports = {getProjectAndTasks};
