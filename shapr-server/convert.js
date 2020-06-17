const path = require("path");
require("dotenv").config({ path: ".env" });

const Redis = require("ioredis");
const redis = new Redis({
    host: process.env.RD_HOST,
    port: process.env.RD_PORT 
});

const Database = require('./database');
const logger = require("pino")({
    prettyPrint: { colorize: true, translateTime: true },
    name: "convertcontrol"
  });

var spawn = require('child_process').spawn;

var id = process.argv[2];
var input_file = process.argv[3];
var target = process.argv[4];

var basename = path.basename(input_file, path.extname(input_file));

input_file = "./files/" + id + "/" + input_file;
var output_file = "./files/" + id + "/" + basename

logger.info(input_file);
logger.info(output_file);

let r = /\d+/;

function convert(){
    var child = spawn('node', ['./binary-stub.js', input_file, target, output_file] );
    var scriptOutput = "";

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) {
        logger.info('stdout: ' + data);

        redis.set(id,data.match(r));
    
        data=data.toString();
        scriptOutput+=data;
    });
    
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
        logger.info('stderr: ' + data);

        data=data.toString();
        scriptOutput+=data;
    });
    
    child.on('close', function(code) {
        if(code === 0){
            Database.updateConversion(id,2,undefined,basename + "." + target).then(()=>{
                process.exit()
            })
        } else {
            Database.updateConversion(id,3).then(()=>{
                process.exit()
            })
        }    
        logger.info('closing code: ' + code);
    });
}

Database.updateConversion(id,1).then((rows) => { // In-progress
    convert()
})


