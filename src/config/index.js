import envJson from "./env.json";
const env = process.env.NODE_ENV || "dev";

export default envJson[env];