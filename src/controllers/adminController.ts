import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import { AuthModel } from "models";
import { Role } from "types/authTypes";

const createRoleList = (roles: Role[]) => {
  var roleList: Role[] = [];

  for (const item of roles) {
    if (item.parent === "") roleList.push(item);
  }

  const addChildren = (roleItem: Role) => {
    for (const item of roles) {
      if (roleItem.role === item.parent) {
        roleItem.children.push(item);
        addChildren(item);
      }
    }
  };

  for (const roleItem of roleList) {
    addChildren(roleItem);
  }

  return roleList;
};

const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await AuthModel.User.find({ admin: false }, { username: 1, lastLogin: 1, online: 1, roles: 1, admin: 1 });
    return res.status(200).send({ users: users });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = (await AuthModel.Role.find()) as Role[];
    return res.status(200).send({ roles: createRoleList(roles) });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

const addUser = async (req: Request, res: Response) => {
  try {
    const roles = (await AuthModel.Role.find()) as Role[];

    const user = new AuthModel.User({
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password, 8),
      last_login: "",
      online: false,
      roles: roles,
      admin: false,
    });

    user.save();
    return res.status(200).send({ message: "User Added." });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

const addRole = async (req: Request, res: Response) => {
  const checkRoles = (await AuthModel.Role.find()) as Role[];
  for (const item of checkRoles) {
    if (item.role === req.body.role && item.parent === req.body.parent) return res.status(404).send({ message: "Role already exists." });
  }

  try {
    const newRole = new AuthModel.Role({
      role: req.body.role,
      parent: req.body.parent,
      name: req.body.name,
      status: false,
      children: [],
    });

    newRole.save();

    await AuthModel.User.updateMany({ admin: false, "roles.role": { $ne: [newRole.role, newRole.parent] } }, { $push: { roles: newRole } });

    const roles = (await AuthModel.Role.find()) as Role[];
    return res.status(200).send({ message: "Role added.", roles: createRoleList(roles) });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

const updateUserRole = (req: Request, res: Response) => {
  AuthModel.User.findOne({ username: req.body.username }, (err: any, user: any) => {
    if (err) return res.status(500).send({ message: err });

    let userRoles = user.roles;

    const roleSearch = (role: Role) => {
      if (role.role !== req.body.role) {
        for (const item of role.children) {
          roleSearch(item);
        }
      } else role.status = !role.status;
    };

    for (const role of userRoles) {
      roleSearch(role);
    }

    AuthModel.User.findOneAndUpdate({ username: req.body.username }, { roles: userRoles }, (err: any, updatedUser: any) => {
      if (err) return res.status(500).send({ message: err });

      const newUser = {
        username: updatedUser.username,
        lastLogin: updatedUser.last_login,
        online: updatedUser.online,
        roles: userRoles,
        admin: updatedUser.admin,
      };

      res.status(200).send({ message: "Role has been updated.", user: newUser });
    });
  });
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    await AuthModel.User.findOneAndDelete({ username: req.body.username });
    return res.status(200).send({ message: "User deleted." });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

const deleteRole = async (req: Request, res: Response) => {
  try {
    const reqRole = req.body.role;
    let roleList = [reqRole.role];
    let parentList = [reqRole.parent];

    const addToList = (role: Role) => {
      for (const item of role.children) {
        roleList.push(item.role);
        parentList.push(item.parent);
        if (item.children.length > 0) addToList(item);
      }
    };

    addToList(reqRole);

    await AuthModel.Role.deleteMany({ role: roleList, parent: parentList });

    await AuthModel.User.updateMany(
      { admin: false },
      {
        $pull: {
          roles: {
            role: { $in: roleList },
            parent: { $in: parentList },
          },
        },
      }
    );

    const roles = (await AuthModel.Role.find()) as Role[];
    return res.status(200).send({ message: "Role deleted.", roles: createRoleList(roles) });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

const adminControllers = {
  getUsers,
  getRoles,
  addUser,
  addRole,
  updateUserRole,
  deleteUser,
  deleteRole,
};
export default adminControllers;
