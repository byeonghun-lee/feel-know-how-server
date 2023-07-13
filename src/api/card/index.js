import Router from "koa-router";
import * as cardCtrl from "api/card/card.crtl";
import checkedLogin from "lib/checkedLogin";

const card = new Router();

card.get("/", cardCtrl.getCards);
card.post("/", checkedLogin, cardCtrl.createCard);
card.patch("/:cardId/read-status", checkedLogin, cardCtrl.updateReadStatus);
card.patch("/:cardId", cardCtrl.updateCard);

export default card;
