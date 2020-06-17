"use strict";

require("dotenv").config({ path: ".env" });

const logger = require("pino")({
  prettyPrint: { colorize: true, translateTime: true },
  name: "server",
});

const Koa = require("koa"); 
const app = new Koa();

const httpLogger = require("koa-pino-logger")({
  prettyPrint: { colorize: true, translateTime: true },
});
app.use(httpLogger);

const cors = require("@koa/cors");
app.use(cors());

const respond = require("koa-respond");
app.use(respond());

var bodyParser = require("koa-bodyparser");
app.use(
  bodyParser({
    jsonLimit: "2kb",
    formLimit: "2kb",
  })
);

const apiRouter = require("./api");
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

const serve = require("koa-static");
const mount = require("koa-mount");
app.use(mount("/shapr/files", serve("./files")));

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
