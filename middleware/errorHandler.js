const { constants } = require("../constants");

const errorHandler = (err, req, res, next) => {
    // Use a fallback value in case the statusCode is undefined
    let statusCode = err.statusCode || constants.SERVER_ERROR || 500;
    let message = err.message || "Something went wrong";
    let stackTrace = err.stack || " ";

    // Handle specific error types for Axios and network issues
    if (err.isAxiosError) { // This checks for Axios errors
        statusCode = constants.SERVER_ERROR || 500;  // Fallback to 500 if SERVER_ERROR is undefined
        // Handle Axios-specific errors here
        if (err.response) {
            // If the response exists, it's an HTTP error response from the API
            message = `API Error: ${err.response.data?.message || "Unknown error"}`;
        } else if (err.request) {
            // If no response was received, it could be a network issue
            message = "Network Error: Failed to connect to the API.";
        } else if (err.code === "ETIMEOUT" || err.code === "ECONNABORTED") {
            // Handle timeout or connection abort errors
            statusCode = constants.TIMEOUT_ERROR || 504;  // Fallback to 504 if TIMEOUT_ERROR is undefined
            message = "Request timed out. Please try again later!";
        } else {
            // For other Axios errors
            message = `Request Error: ${err.message}`;
        }
    } else if (err.name === "NotFoundError") {
        statusCode = constants.NOT_FOUND || 404;  // Fallback to 404 if NOT_FOUND is undefined
        message = "Project not found!";
    } else if (err.name === "NetworkError") {
        statusCode = constants.NETWORK_ERROR || 1001;  // Fallback to 1001 if NETWORK_ERROR is undefined
        message = "Network connectivity issue. Please check your connection.";
    } else if (err.name === "TimeoutError") {
        statusCode = constants.REQUEST_TIMEOUT || 1002;  // Fallback to 1002 if REQUEST_TIMEOUT is undefined
        message = "Request timed out. Please try again later!";
    } else {
        // Default case for any unknown errors
        statusCode = constants.SERVER_ERROR || 500;  // Fallback to 500 if SERVER_ERROR is undefined
        message = "Something went wrong! Please try again later.";
    }

    // Sending error response
    res.status(statusCode).json({
        title: statusCode === constants.SERVER_ERROR ? "Server Error" : "Error",
        message: message,
        stackTrace: stackTrace
    });
};

// Export the function to be used for error handling
module.exports = errorHandler;
