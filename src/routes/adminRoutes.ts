import { Express } from "express";

import verifyToken from "auth/verifyToken";
import adminControllers from "controllers/adminController";

const adminRoutes = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    next();
  });

  //GET
  app.get("/api/admin/get/users", [verifyToken], adminControllers.getUsers);
  app.get("/api/admin/get/roles", [verifyToken], adminControllers.getRoles);

  //POST
  app.post("/api/admin/post/user/add", [verifyToken], adminControllers.addUser);
  app.post("/api/admin/post/user/delete", [verifyToken], adminControllers.deleteUser);
  app.post("/api/admin/post/user/role/update", [verifyToken], adminControllers.updateUserRole);

  app.post("/api/admin/post/role/add", [verifyToken], adminControllers.addRole);
  app.post("/api/admin/post/role/delete", [verifyToken], adminControllers.deleteRole);
};

export default adminRoutes;
