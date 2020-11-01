import Joi from "joi";
import Auth from "./auth";
import db from "db";

/*
POST /auth/register
{
    email: "hun08@feelknowhow.com",
    passowrd: "feelknowhow"
}

or {
    phoneNumber: "01099633421",
    password: "feelknowhow"
}
*/

export const register = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();
    
    const schema = Joi.object({
        email: Joi.string(),
        phoneNumber: Joi.string(),
        password: Joi.string().required(),
    }).or("email", "phoneNumber");
    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const {email, phoneNumber, password} = ctx.request.body;

    try {
        const exists = await Auth.findByIdentity({ email,phoneNumber});

        if(exists) {
            ctx.status = 409;
            return;
        }

        const auth = new Auth({email, phoneNumber, password});
        await auth.setPassword(password);
        await auth.save();

        ctx.body = auth.serialize();
        return;
    } catch (error) {
        console.log("Register Error:", error);
        ctx.throw(500, e);
    }
};
