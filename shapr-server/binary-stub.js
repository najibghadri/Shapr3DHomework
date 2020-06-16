var path = require("path");

var input = process.argv[2];
var type = process.argv[3];
var output = process.argv[4];

var basename = path.basename(input, path.extname(input));

if (path.extname(input) !== ".shapr") throw Error("Wrong input fileformat");

var progress = 0;

function fakework() {
  setTimeout(() => {
    if (progress !== 100) {
      if(basename === "fail" && progress === 60) throw Error("Conversion failed");
      console.log("progress: %d%", progress);
      progress = progress + 10;
      fakework()
    } else {
      console.log("progress: %d%", progress);

      return;
    }
  }, (Math.floor(Math.random() * 2.5) + 0.5) *1000  );
}

fakework()