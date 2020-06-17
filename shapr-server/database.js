require("dotenv").config({ path: ".env" });

// Could be moved to a knexfile with different configs, and migration
var knex = require("knex")({
  client: "pg",
  version: process.env.PG_VERSION,
  connection: {
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASS,
    database: process.env.PG_DATABASE,
  },
});

let conversiontable = "conversiontx";

class Database {
  // Each method returns a Promise
  static allConversions(userid) {
    return knex(conversiontable)
      .where({
        user_id: userid,
      })
      .select("*");
  }

  static getConversion(userid, conversionid) {
    return knex(conversiontable)
      .where({
        user_id: userid,
        id: conversionid,
      })
      .select("*");
  }

  static newConversion(id, userid, status, targettype, inputname, outputname) {
    return knex(conversiontable)
      .insert({
        id: id,
        user_id: userid,
        status: status,
        target_type: targettype,
        input_file: inputname,
        output_file: outputname,
        created_at: new Date(Date.now()).toISOString(), // with timezone, adjusted to UTC
      })
      .returning("*");
  }

  static updateConversion(id, status) {
    return knex(conversiontable)
      .where({
        id: id,
      })
      .update({
        status: status,
      })
      .returning("*");
  }
}

module.exports = Database;
