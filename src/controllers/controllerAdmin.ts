import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import Users from "models/auth/modelUser";
import Roles from "models/auth/modelRole";
import { Role } from "types/authTypes";

const createRoleList = (roles: Role[]) => {
  const roleList: Role[] = [];

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

const camelCase = (str: string) => {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await Users.find();
    return res.status(200).send({ users: users });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = (await Roles.find()) as Role[];
    return res.status(200).send({ roles: createRoleList(roles) });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

export const addUser = async (req: Request, res: Response) => {
  try {
    const roles = (await Roles.find()) as Role[];

    const user = new Users({
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password, 8),
      last_login: "",
      online: false,
      roles: roles,
      admin: false,
    });

    user.save();

    const users = await Users.find({ admin: false }, {});

    return res.status(200).send({ message: "User added.", users: users });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

export const addRole = async (req: Request, res: Response) => {
  let parent = "";
  const parentRole = req.body.role;
  if (parentRole) parent = parentRole.role;
  const roleName = req.body.roleName;

  const role = camelCase(roleName);

  const checkRoles = (await Roles.find()) as Role[];
  for (const item of checkRoles) {
    if (item.role === role && item.parent === parent) return res.status(404).send({ message: "Role already exists." });
  }

  try {
    let path = "";
    if (parentRole) {
      const pathName = roleName.toLowerCase().replace(/\s+/g, "_");
      path = `${parentRole.path}/${pathName}`;
    } else path = `/${role}`;

    const newRole = new Roles({
      role: role,
      parent: parent,
      path: path,
      name: roleName,
      status: false,
      children: [],
    });

    newRole.save();

    await Users.updateMany({ "roles.role": { $ne: [newRole.role, newRole.parent] } }, { $push: { roles: newRole } });

    const roles = (await Roles.find()) as Role[];
    return res.status(200).send({ message: "Role added.", roles: createRoleList(roles) });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const user = await Users.findOne({ username: req.body.username });
    let userRoles = user.roles;

    for (const role of userRoles) {
      if (role._id.toString() === req.body.role_id) {
        role.status = !role.status;
        break;
      }
    }

    const updatedUser = await Users.findOneAndUpdate({ username: req.body.username }, { roles: userRoles });
    const newUser = {
      username: updatedUser.username,
      lastLogin: updatedUser.lastLogin,
      online: updatedUser.online,
      roles: userRoles,
      admin: updatedUser.admin,
      _id: updatedUser._id,
    };
    return res.status(200).send({ message: "Role has been updated.", user: newUser });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await Users.findOneAndDelete({ username: req.body.username });
    const users = await Users.find({ admin: false }, {});
    return res.status(200).send({ message: "User deleted.", users: users });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
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

    await Roles.deleteMany({ role: roleList, parent: parentList });

    await Users.updateMany(
      {},
      {
        $pull: {
          roles: {
            role: { $in: roleList },
            parent: { $in: parentList },
          },
        },
      }
    );

    const roles = (await Roles.find()) as Role[];
    return res.status(200).send({ message: "Role deleted.", roles: createRoleList(roles) });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
