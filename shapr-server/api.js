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

router
  .get("/conversion",  async (ctx, next) => {
    Database.allConversions(0).then((rows) => {
      ctx.ok(rows)
    })
  })
  .post('/conversion', async (ctx, next) => {
    let id = nanoid();
    Database.newConversion(id, 0, 0, "iges","hello.shapr", "bye.iges").then((rows) => console.log(rows))
  })
  .get("/conversion/:id", async  (ctx, next) => {
    Database.getConversion(0, "5d2f3f2722e5b5e2b8b763d22547ae3c").then((rows) => {
      if(rows.length>=1){
        ctx.ok(rows[0])
      } else {
        ctx.notFound('Conversion not found')
      }
      
    })
  }).get("/file/:id", async  (ctx, next) => {
    
  });

  module.exports = router;