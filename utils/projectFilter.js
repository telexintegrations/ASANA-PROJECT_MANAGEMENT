// Function to get the selected custom field value (e.g., priority or status)
const getSelectedCustomField = (projectData, fieldName) => {
    const customFieldSetting = projectData.custom_field_settings.find(field => field.custom_field.name === fieldName);
    if (customFieldSetting) {
      // Return the name of all options
        return customFieldSetting.custom_field.enum_options.map(option => option.name);
    }
    return ["Not set"]; // Default value for missing custom fields
};
  
// Function to filter tasks based on their status
const filterTasksByStatus = (tasks, status) => {
    return tasks.filter(task => task.status === status);
};

// Function to categorize tasks as completed, pending, or overdue
const categorizeTasks = (tasks) => {
    const completedTasks = filterTasksByStatus(tasks, 'Completed');
    const pendingTasks = filterTasksByStatus(tasks, 'Pending');
    
    // Handling overdue tasks, checking the due date
    const dueTasks = tasks.filter(task => {
        const dueDate = task.due_on ? new Date(task.due_on) : null;
        const status = task.status || 'Pending'; 
        return dueDate && dueDate < new Date() && status !== 'Completed';
    });
    return { completedTasks, pendingTasks, dueTasks };
};
  
// Function to format the date in a human-readable format
const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
    });
};

// Function to filter and extract relevant project details
const filterProjectDetails = (projectData, tasksData) => {
// Ensure tasksData is passed into categorizeTasks
    const taskOverview = categorizeTasks(tasksData);
    
    return {
        projectName: projectData.name,
        projectId: projectData.gid,
        owner: projectData.owner ? projectData.owner.name : "Unknown Owner",
        team: projectData.team ? projectData.team.name : "Unknown Team",
        workspace: projectData.workspace ? projectData.workspace.name : "Unknown Workspace",
        status: getSelectedCustomField(projectData, "Status"),
        priority: getSelectedCustomField(projectData, "Priority"),
        dueDate: projectData.due_on ? formatDate(projectData.due_on) : "Project Due Date Not specified",
        archived: projectData.archived !== undefined ? projectData.archived : false,
        completed: projectData.completed !== undefined ? projectData.completed : false,
        permalinkUrl: projectData.permalink_url || "Not available",
        members: projectData.members ? projectData.members.map(member => member.name) : ["No members"],
        followers: projectData.followers ? projectData.followers.map(follower => follower.name) : ["No followers"],
        lastModifiedAt: projectData.modified_at ? formatDate(projectData.modified_at) : "Not available",

        // Adding detailed task information
        tasksOverview: {
            completedTasks: taskOverview.completedTasks.map(task => ({
            taskId: task.gid,
            taskName: task.name || "No task name",
            taskDescription: task.notes || "No task description available",
            assignee: task.assignee ? task.assignee.name : "Not assigned",
            priority: task.priority || "Priority not set",
            dueDate: task.due_on ? formatDate(task.due_on) : "No due date set",
            status: task.status || "Status Not set"
        })),
        pendingTasks: taskOverview.pendingTasks.map(task => ({
            taskId: task.gid,
            taskName: task.name || "No task name",
            taskDescription: task.notes || "No task description",
            assignee: task.assignee ? task.assignee.name : "Task not assigned",
            priority: task.priority || "Task priority not set",
            dueDate: task.due_on ? formatDate(task.due_on) : "Task due date not specified",
            status: task.status || "Task status not set"
        })),
        dueTasks: taskOverview.dueTasks.map(task => ({
            taskId: task.gid,
            taskName: task.name || "No task name",
            taskDescription: task.notes || "No task description",
            assignee: task.assignee ? task.assignee.name : "Task not assigned",
            priority: task.priority || "Task priority not set",
            dueDate: task.due_on ? formatDate(task.due_on) : "Task due date not specified",
            status: task.status || "Task status not set"
        }))
    }};
};

// Export the function to be used in the projectController
module.exports = {filterProjectDetails};