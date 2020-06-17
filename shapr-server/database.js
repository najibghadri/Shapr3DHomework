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

const Redis = require("ioredis");
const redis = new Redis({
  host: process.env.RD_HOST,
  port: process.env.RD_PORT,
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

  static async getConversion(userid, conversionid) {
    let rows = await knex(conversiontable)
      .where({
        user_id: userid,
        id: conversionid,
      })
      .select("*");

    if (rows.length >= 1) {
      let row = rows[0];
      return redis.get(row.id).then((progress) => {
        row.progress = progress;
        return row;
      });
    } else {
      throw Error("Conversion not found");
    }
  }

  static newConversion(id, userid, status, targettype, inputname, outputname) {
    return knex(conversiontable)
      .insert({
        id: id,
        status: status,
        target_type: targettype,
        input_file: inputname,
        output_file: outputname,
        created_at: new Date(Date.now()).toISOString(), // with timezone, adjusted to UTC
        finished_at: null,
        user_id: userid,
      })
      .returning("*");
  }

  static updateConversion(id, status, input_file, output_file) {
    return knex(conversiontable)
      .where({
        id: id,
      })
      .update({
        status: status,
        input_file: input_file,
        output_file: output_file,
        finished_at: new Date(Date.now()).toISOString(),
      })
      .returning("*");
  }
}

module.exports = Database;
