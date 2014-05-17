/**
 * Module dependencies.
 */

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    path = require('path'),
    io = require('socket.io').listen(server),
    spawn = require('child_process').spawn,
    omx = require('omxcontrol');

// all environments
app.set('port', process.env.TEST_PORT || 8080);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(omx());

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//Routes
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

app.get('/remote', function (req, res) {
    res.sendfile(__dirname + '/public/remote.html');
});

app.get('/play/:video_id', function (req, res) {

});


//Socket.io Config
io.set('log level', 1);

server.listen(app.get('port'), function () {
    console.log('Pirate TV is running on port ' + app.get('port'));
});

var ss, currentShell;

//Run and pipe shell script output
function runShell(cmd, args, cb, end) {
    var child = spawn(cmd, args),
        me = this;
    child.stdout.on('data', function (buffer) {
        cb(me, buffer);
    });
    child.stdout.on('end', end);
    return child;
}

//Socket.io Server
io.sockets.on('connection', function (socket) {

    socket.on("screen", function (data) {
        socket.type = "screen";
        ss = socket;
        console.log("Screen ready...");
    });
    socket.on("remote", function (data) {
        socket.type = "remote";
        console.log("Remote ready...");
    });

    socket.on("controll", function (data) {
        console.log(data);
        if (socket.type === "remote" && ss !== undefined) {
            var action = null;
            switch (data.action) {
                case 'tap':
                    action = 'enter';
                    break;
                case 'swipeLeft':
                    action = 'goLeft';
                    break;
                case 'swipeRight':
                    action = 'goRight';
                    break;
            }

            if (action) {
                ss.emit('controlling', {
                    action: action
                });
            }
        }
    });

    function startVideo(url) {
        currentShell = new runShell('youtube-dl', ['-o', '%(id)s.%(ext)s', '-f', '/18/22', url],
            function (me, buffer) {
                me.stdout += buffer.toString();
                socket.emit("loading", {output: me.stdout});
                console.log(me.stdout);
            },
            function () {
                omx.start(id + '.mp4');
            }
        );
    }

    socket.on("video", function (data) {
        if (data.action === "play") {
            var id = data.video_id,
                url = "http://www.youtube.com/watch?v=" + id;

            if (currentShell) {
                currentShell.on('disconnect', function() {
                    startVideo(url);
                });
                currentShell.disconnect();
            } else {
                startVideo(url);
            }


        }

    });
});
