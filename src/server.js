import serverless from "serverless-http";
import Koa from "koa";
import bodyParser from "koa-bodyparser"
import api from "api";
import jwtMiddleware from "./lib/jwtMiddleware";

const app = new Koa();

app.use(bodyParser());
app.use(jwtMiddleware);
app.use(api.routes());

if(process.env.APP_ENV === "local") {
    app.listen(4000, (err) => {
        if(err) {
            console.log("err:", err);
        }
    
        console.log("server running!");
    });
}

export const handler = serverless(app);