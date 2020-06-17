"use strict";

require("dotenv").config({ path: ".env" });

const logger = require("pino")({
  prettyPrint: { colorize: true, translateTime: true },
  name: "server"
});
const httpLogger = require("koa-pino-logger")({
  prettyPrint: { colorize: true, translateTime: true }
});

const Koa = require("koa");
const app = new Koa();

const respond = require("koa-respond");
var bodyParser = require("koa-bodyparser");

app.use(httpLogger);
app.use(respond());
app.use(
  bodyParser({
    jsonLimit: "2kb",
  })
);

const apiRouter = require("./api");

app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

const http = require("http");
const server = http.createServer(app.callback());
const port = process.env.PORT || 3000;
server.listen(
  {
    host: "localhost",
    port: port,
  },
  () => {
    logger.info("Server started on port " + port);
  }
);

module.exports = server;
