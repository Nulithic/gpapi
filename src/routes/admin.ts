import { Express } from "express";

import verifyToken from "auth/verifyToken";
import admin from "controllers/admin";

const adminRoutes = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    next();
  });

  //GET
  app.get("/api/admin/get/users", [verifyToken], admin.getUsers);
  app.get("/api/admin/get/roles", [verifyToken], admin.getRoles);

  //POST
  app.post("/api/admin/post/user/add", [verifyToken], admin.addUser);
  app.post("/api/admin/post/user/delete", [verifyToken], admin.deleteUser);
  app.post("/api/admin/post/user/role/update", [verifyToken], admin.updateUserRole);

  app.post("/api/admin/post/role/add", [verifyToken], admin.addRole);
  app.post("/api/admin/post/role/delete", [verifyToken], admin.deleteRole);
};

export default adminRoutes;
