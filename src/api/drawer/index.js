import Router from "koa-router";
import * as drawerCtrl from "api/drawer/drawer.ctrl";
import checkedLogin from "lib/checkedLogin";

const drawer = new Router();

drawer.get("/", checkedLogin, drawerCtrl.getDrawers);
drawer.post("/", checkedLogin, drawerCtrl.createDrawer);
drawer.get("/public", drawerCtrl.getPublicDrawers);

export default drawer;