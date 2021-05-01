import AWS from "aws-sdk";
import awsCredentials from "config/aws-credentials.json";

export const initAws = () => {
    AWS.config.update(awsCredentials);
    global.AWS = AWS;
};
