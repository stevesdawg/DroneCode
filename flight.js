var arDrone = require('ar-drone');
var http = require('http');
var ff = require('ffmpeg');

var drone = arDrone.createClient();
console.log('taking off')
drone.takeoff();
console.log('took off')

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
            var boxh = parseInt(jsonObj.boxheight);
            if (boxh == -1) {
                drone.stop();
                count += 1;
                if (count > 100) {
                    drone.land();
                }
            }
            else {
                count = 0;
                var centerx = 200;
                var centery = 225/2.0;
                var boxcX = parseInt(jsonObj.boxcenterx);
                var boxcY = parseInt(jsonObj.boxcentery);
                if (boxcX < centerx) {
                    drone.left((centerx - boxcX) * 0.30 / centerx);
                } else {
                    drone.right((boxcX - centerx) * 0.30 / centerx);
                }

                if (boxcY < centery) {
                    drone.down((centery - boxcY) * 0.30 / centery);
                } else {
                    drone.up((boxcY - centery) * 0.30 / centery);
                }

                // var scaleFactor = boxh / 150.0;
                // if (scaleFactor > 1) {
                //     drone.back(0.2 * scaleFactor);
                // } else {
                //     drone.front(0.2 * 1/scaleFactor);
                // }
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

server.listen(8080, function() {
    console.log('Serving latest png on port 8080...');
});