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
  destination: './files',
  filename: function (req, file, cb) {
    console.log(req)
    cb(null, file.originalname)
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
      const rows = awaitDatabase.newConversion(id, 0, 0, "iges","hello.shapr", "bye.iges");
      if(rows.length>=1){
        ctx.ok(rows[0])
      } else {
        ctx.notFound('Start again')
      }
    })
  .get("/conversion/:id", async  (ctx, next) => {
    const rows = awaitDatabase.getConversion(0, "5d2f3f2722e5b5e2b8b763d22547ae3c");
    if(rows.length>=1){
      ctx.ok(rows[0])
    } else {
      ctx.notFound('Conversion not found')
    }
  }).post('/upload', upload.single('input'),
  ctx => {
    console.log('ctx.request.files', ctx.request.files);
    console.log('ctx.files', ctx.files);
    console.log('ctx.request.body', ctx.request.body);
    ctx.body = 'done';
  });

const serve = require('koa-static');
router.use('/files',  serve('./files'))

module.exports = router;