var arDrone = require('ar-drone');
var http = require('http');
var ff = require('ffmpeg');

var drone = arDrone.createClient();
drone.takeoff();

var pngStream = drone.getPngStream();
var count = 0;

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
            jsonObj = JSON.parse(data);
            if (jsonObj.boxheight == -1) {
                drone.stop();
                count += 1;
                if (count > 20) {
                    drone.land();
                }
            }
            else {
                count = 0;
                var centerx = 200;
                var centery = 225/2.0;
                if (jsonObj.boxcenter[0] < centerx) {
                    drone.left((centerx - jsonObj.boxcenter[0]) * 0.3 / centerx);
                } else {
                    drone.right((jsonObj.boxcenter[0] - centerx) * 0.3 / centerx);
                }

                if (jsonObj.boxcenter[1] < centery) {
                    drone.down((centery - jsonObj.boxcenter[1]) * 0.3 / centery);
                } else {
                    drone.up((jsonObj.boxcenter[1] - centery) * 0.3 / centery);
                }

                var scaleFactor = jsonObj.boxheight / 210.0;
                if (scaledFactor > 1) {
                    drone.back(0.4 * scaledFactor);
                } else {
                    drone.front(0.4 * 1/scaledFactor)
                }
            }
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

var stdin = process.openStdin();
require('tty').setRawMode(true);
var rl = require('readline');

stdin.on('keypress', function (chunk, key) {
    process.stdout.write('Get Chunk: ' + chunk + '\n');
    if (key && key.name == ' ') {
        drone.land();
    }
});

server.listen(8080, function() {
    console.log('Serving latest png on port 8080...');
});