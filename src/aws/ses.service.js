export const sendEmail = async ({ toAddress, subject, message }) => {
    if (!toAddress || !subject || !message) {
        throw new Error("Missing required params in sendEmail.");
    }

    const params = {
        Destination: {
            /* required */
            ToAddresses: [toAddress],
        },
        Message: {
            /* required */
            Body: {
                /* required */
                // Html: {
                //     Charset: "UTF-8",
                //     Data: "HTML_FORMAT_BODY",
                // },
                Text: {
                    Charset: "UTF-8",
                    Data: message,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
        Source: "info@ohmydrawer.com" /* required */,
        ReplyToAddresses: ["info@ohmydrawer.com"],
    };

    try {
        await new AWS.SES({ apiVersion: "2010-12-01" })
            .sendEmail(params)
            .promise();

        return;
    } catch (error) {
        console.log("Send email error:", error);
    }
};
