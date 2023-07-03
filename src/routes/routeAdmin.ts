import { Express } from "express";

import verifyToken from "auth/verifyToken";
import { addRole, addUser, deleteRole, deleteUser, getRoles, getUsers, updateUserRole } from "controllers/controllerAdmin";

const routeAdmin = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    next();
  });

  //GET
  app.get("/api/admin/get/users", [verifyToken], getUsers);
  app.get("/api/admin/get/roles", [verifyToken], getRoles);

  //POST
  app.post("/api/admin/post/user/add", [verifyToken], addUser);
  app.post("/api/admin/post/user/delete", [verifyToken], deleteUser);
  app.post("/api/admin/post/user/role/update", [verifyToken], updateUserRole);

  app.post("/api/admin/post/role/add", [verifyToken], addRole);
  app.post("/api/admin/post/role/delete", [verifyToken], deleteRole);
};

export default routeAdmin;
