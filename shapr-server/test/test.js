const axios = require("axios").default;
const { performance } = require("perf_hooks");

var endpoint = "http://localhost:3000/shapr";

////////////////////
/// GET /shapr/conversion/
///////////////////

// var t0 = performance.now();

// var n = 10000;
// var fetches = [];
// for (var i = 0; i < n; i++) {
//   console.log(i);
//   fetches.push(axios.get(endpoint + "/conversion").then());
// }

// Promise.all(fetches)
//   .then(() => {
//     var t1 = performance.now();
//     console.log(
//       "DONE. to GET all conversions took " + (t1 - t0) + " milliseconds."
//     );
//   })
//   .catch((e) => {
//     var t1 = performance.now();
//     console.log(
//       "DONE. to GET all conversions took " + (t1 - t0) + " milliseconds."
//     );
//   });

////////////////////
/// POST /shapr/conversion/ followed by POST /shapr/upload/
///////////////////

// var FormData = require("form-data");
// var fs = require("fs");

var t0 = performance.now();

var n = 1000;
var fetches = [];

for (var i = 0; i < n; i++) {
  console.log(i);
  fetches.push(
    axios
      .post(endpoint + "/conversion", {
        targettype: "iges",
      })
  );
}

Promise.all(fetches)
  .then(() => {
    var t1 = performance.now();
    console.log(
      "DONE. new transactions took " + (t1 - t0) + " milliseconds."
    );
  })
  .catch((e) => {
    var t1 = performance.now();
    console.log(
      "DONE. to GET all conversions took " + (t1 - t0) + " milliseconds."
    );
  });
