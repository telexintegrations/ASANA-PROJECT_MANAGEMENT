const constants = {
    // HTTP Status Codes
    NOT_FOUND: 404,                // Resource not found (like project not found in Asana)
    SERVER_ERROR: 500,             // General server error
    TIMEOUT_ERROR: 504,            // Timeout error (e.g., server did not respond in time)
    NETWORK_ERROR: 1001,           // Network connectivity issues (e.g., no internet)
    REQUEST_TIMEOUT: 1002,         // Timeout error, typically for requests that take too long
    RESOURCE_NOT_FOUND: 1003,      // Specific error for "project not found"
};

// Export the function to be used for error handling
module.exports = { constants }