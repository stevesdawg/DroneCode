var arDrone = require('ar-drone');
var http = require('http');
var ff = require('ffmpeg');

var drone = arDrone.createClient();
// drone.takeoff();


// setTimeout(function(){drone.land()}, 5000);

var pngStream = drone.getPngStream();

var lastPng;
pngStream
    .on('error', console.log)
    .on('data', function(pngBuffer) {
        lastPng = pngBuffer;
    });

var server = http.createServer(function(req, res) {
    if (req.method == "POST") {
        console.log("POST");
        var body = '';
        req.on('data', function(data) {
            body += data;
        });
        req.on('end', function() {
            console.log("Body: " + body);
        });
    }
    if (!lastPng) {
        res.writeHead(503);
        res.end('Did not receive any png data yet.');
        return;
    }

    res.writeHead(200, {'Content-Type': 'image/png'});
    res.end(lastPng);
});

server.listen(8080, function() {
    console.log('Serving latest png on port 8080...');
});