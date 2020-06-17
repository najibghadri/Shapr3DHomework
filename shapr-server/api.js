const Router = require("@koa/router");
const router = new Router({
  prefix: '/shapr'
});

const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  32
);
const Database = require('./database');

const multer = require('@koa/multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './files')
  },
  filename: function (req, file, cb) {
    cb(null, nanoid() + "." + file.originalname)
  }
}
);
var upload = multer({ storage: storage })

router
  .get("/conversion",  async (ctx, next) => {
    const rows = await Database.allConversions(0);
    ctx.ok(rows)
  })
  .post('/conversion', 
    async (ctx, next) => {
      let id = nanoid();
      const rows = await Database.newConversion(id, 0, 0,ctx.request.body.targettype, null, null);
      if(rows.length>=1){
        ctx.ok(rows[0])
      } else {
        ctx.notFound('Start again')
      }
    })
  .get("/conversion/:id", async  (ctx, next) => {
    const rows = await Database.getConversion(0, ctx.params.id);
    if(rows.length>=1){
      ctx.ok(rows[0])
    } else {
      ctx.notFound('Conversion not found')
    }
  }).post('/upload', upload.single('file'),
  async (ctx, next) => {
    const rows = await Database.updateConversionInput(ctx.request.body.txid, ctx.request.file.filename);
    if(rows.length>=1){
      ctx.ok(rows[0])
    } else {
      ctx.notFound('Conversion not found')
    }
  });



module.exports = router;