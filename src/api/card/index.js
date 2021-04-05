import Router from "koa-router";
import * as cardCtrl from "api/card/card.crtl";
import checkedLogin from "lib/checkedLogin";

const card = new Router();

card.get("/", checkedLogin, cardCtrl.getCards);
card.post("/", cardCtrl.createCard);

export default card;