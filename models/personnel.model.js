const db = require("../utils/db");
const bcrypt = require("bcryptjs");
const createError = require("https-error");

const model = {
  add: async (person) => {
    try {
      person.password = bcrypt.hashSync(person.password, 8);
      const username = person.username;
      return await db.add(person, "personnel");
    } catch (error) {
      throw new createError(400, error);
    }
  },
  delById: async (id) => {
    try {
      await db.del({ id: id }, "personnel");
      return true;
    } catch (err) {
      console.log(err);
      throw createError(500, "Failed to delete person");
    }
  },
  login: async (username, password) => {
    try {
      const users = await db.load(
        `select * from personnel where username = "${username}" and password = "${password}"`
      );
      if (!users[0]) {
        throw createError(401, `Wrong username or password`);
      }
    } catch (err) {
      console.log(err);
      throw createError(500, err);
    }
  },
  getSingleById: async (id) =>
    await db.load(`select * from personnel where id = ${id}`),
  getAll: async (id) => await db.load(`select * from personnel`),
  getSingleByUsername: async (username) => {
    try {
      const users = await db.load(
        `select * from personnel where username = "${username}"`
      );
      return users[0];
    } catch (error) {
      console.log(error);
      throw new createError(500, error);
    }
  },
  updateById: async (person, id) => {
    try {
      if (person.password) {
        person.password = bcrypt.hashSync(person.password, 8);
      }
      console.log("person", person);
      await db.update(person, { id: id }, "personnel");
      //  await db.load(`update personnel set ${person} where id = "${id}" `);
    } catch (err) {
      console.log(err);
      throw new createError(500, "Failed to update person");
    }
    return true;
  },
  checkPermission: async (permission, username) => {
    const existPerson = await model.getSingleByUsername(username);
    console.log(existPerson);
    if (!existPerson) {
      throw new createError(403, `You are not ${permission}`);
    }
    switch (permission) {
      case "admin":
        if (existPerson.admin <= 0) {
          throw new createError(403, `You are not ${permission}`);
        }
        break;
      default:
        throw new createError(500, "Failed to check permission");
    }
  },
};

module.exports = model;
