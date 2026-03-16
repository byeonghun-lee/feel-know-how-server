import Router from "koa-router";
import * as sentenceCtrl from "api/sentence/sentence.ctrl";
import checkedLogin from "lib/checkedLogin";

const sentence = new Router();

sentence.post("/sync", checkedLogin, sentenceCtrl.sync);
sentence.get("/books", checkedLogin, sentenceCtrl.books);
sentence.get("/", checkedLogin, sentenceCtrl.list);
sentence.delete("/:id", checkedLogin, sentenceCtrl.remove);

export default sentence;
