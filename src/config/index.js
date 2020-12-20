import envJson from "config/env.json";
const env = process.env.NODE_ENV || "development";

export default envJson[env];
