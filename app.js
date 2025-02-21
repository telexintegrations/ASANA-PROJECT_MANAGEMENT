const express = require("express");
const path = require("path");
const dotenv = require("dotenv").config();
const cors = require("cors");  // Import CORS middleware
const errorHandler = require("./middleware/errorHandler");

const app = express();

const port = process.env.PORT;

// Middleware for handling CORS (allow cross-origin requests)
app.use(cors({
    origin: [
        "http://staging.telextest.im",
        "http://telextest.im",
        "https://staging.telex.im",
        "https://telex.im"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Middleware to parse JSON requests
app.use(express.json());

// Your project routes for fetching project details
app.use("/", require("./routes/projectRoute"));
app.use("/asana-integration", require("./routes/integrationRoute"));

// Error handler middleware (must be after all routes)
app.use(errorHandler);


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
