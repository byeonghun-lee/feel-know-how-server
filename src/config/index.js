const envJson = require("./env.json");
const env = process.env.NODE_ENV || "dev";

module.exports = envJson[env];