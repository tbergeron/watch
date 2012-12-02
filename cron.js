var http = require('http');

http.get("http://watch.brainpad.org/take_screenshots", function (res) {
    console.log("Got response: " + res.statusCode);
}).on('error', function (e) {
    console.log("Got error: " + e.message);
});