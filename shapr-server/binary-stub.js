const fs = require("fs");
const path = require("path");

var input = process.argv[2];
var type = process.argv[3];
var output = process.argv[4];

var basename = path.basename(input, path.extname(input));
console.log(basename)
console.log(output)
var goinToFail = basename.includes("fail")

if (path.extname(input) !== ".shapr") throw Error("Input file type not supported");

var types = ["step", "iges", "stl", "obj"]

if(!types.includes(type)) throw Error("Output type not supported");

if(!fs.existsSync(input)) throw Error("Input file not found");

var progress = 0;

function fakework() {
  setTimeout(() => {
    if (progress !== 100) {
      if(goinToFail && progress === 60) throw Error("Conversion failed");
      console.log("progress: %d%", progress);
      progress = progress + 10;
      fakework()
    } else {
      console.log("progress: %d%", progress);
      fs.writeFile(output + "." + type, "data", (err) => {
        if (err) throw err;
      });
      return;
    }
  }, (Math.floor(Math.random() * 2) + 0.5) *1000  );
}

fakework()