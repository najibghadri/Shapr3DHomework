const Database = require('./database');
const logger = require("pino")({
    prettyPrint: { colorize: true, translateTime: true },
    name: "compresscontrol"
  });

var spawn = require('child_process').spawn;

var input = process.argv[2];
var type = process.argv[3];
var output = process.argv[4];
var id = process.argv[5];

function compress(){
    var child = spawn('node', ['./binary-stub.js', input, type, output] );
    var scriptOutput = "";

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    
        data=data.toString();
        scriptOutput+=data;
    });
    
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
        console.log('stderr: ' + data);
    
        data=data.toString();
        scriptOutput+=data;
    });
    
    child.on('close', function(code) {
        if(code === 0){
            Database.updateConversion(id,2).then((rows) => console.log(rows))
        } else {
            Database.updateConversion(id,3).then((rows) => console.log(rows))
        }
    
        console.log('closing code: ' + code);
        console.log('Full output of script: ',scriptOutput);
    });
}

Database.updateConversion(id,1).then((rows) => { // In-progress
    compress()
})


