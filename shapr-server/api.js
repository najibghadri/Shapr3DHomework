var fs = require("fs");
var spawn = require('child_process').spawn;

const Router = require("@koa/router");
const router = new Router({
  prefix: "/shapr",
});

const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  32
);
const Database = require("./database");

const multer = require("@koa/multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdirSync("./files/" + req.headers.txid);
    cb(null, "./files/" + req.headers.txid);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
var upload = multer({ storage: storage });

router
  .get("/conversion", async (ctx, next) => {
    const rows = await Database.allConversions(0);
    ctx.ok(rows);
  })
  .post("/conversion", async (ctx, next) => {
    let id = nanoid();
    const rows = await Database.newConversion(
      id,
      0,
      0,
      ctx.request.body.targettype,
      null,
      null
    );
    if (rows.length >= 1) {
      ctx.ok(rows[0]);
    } else {
      ctx.notFound("Start again");
    }
  })
  .get("/conversion/:id", async (ctx, next) => {
    const row = await Database.getConversion(0, ctx.params.id);
    if (row) {
      ctx.ok(row);
    } else {
      ctx.notFound("Conversion not found");
    }
  }) 
  .post("/upload", upload.single("file"), async (ctx, next) => {
    const rows = await Database.updateConversion(
      ctx.request.body.txid,
      undefined,
      ctx.request.file.filename,
      undefined
    );
   
    if (rows.length >= 1) {
      let conversion = rows[0]
      spawn('node', ['./compress.js', conversion.id, conversion.input_file, conversion.target_type] )
      ctx.ok(rows[0]);
    } else {
      ctx.notFound("Conversion not found");
    }
  });

module.exports = router;
