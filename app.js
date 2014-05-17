var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    path = require('path'),
    io = require('socket.io').listen(server),
    spawn = require('child_process').spawn,
    omx = require('omxcontrol');

// Setup the environment
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

// Show the main screen
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

// Show the remote screen
app.get('/remote', function (req, res) {
  res.sendfile(__dirname + '/public/remote.html');
});


//Socket.io Config
io.set('log level', 1);

// Start the server
server.listen(app.get('port'), function(){
  console.log('Pirate TV is running on port ' + app.get('port'));
});

var screenSocket;

/**
 * Run a shell command
 * @param {string}   cmd    Command
 * @param {Array}    args   Arguments
 * @param {Function} cb     Callback for when data comes in
 * @param {Function} end    Callback when the child ends
 */
function runShell(cmd, args, cb, end) {
    var child = spawn(cmd, args),
        me = this;
    child.stdout.on('data', function (buffer) { cb(me, buffer); });
    child.stdout.on('end', end);
}

// For every client connection
io.sockets.on('connection', function (socket) {
    // When the main screen connection
    socket.on('screen', function() {
        socket.type = 'screen';
        screenSocket = socket;
        console.log('Screen ready...');
    });

    // When a remote connects
    socket.on('remote', function() {
        socket.type = 'remote';
        screenSocket = socket;
        console.log('Remote ready...');
    });

    // When a control is received
    socket.on('control', function(data) {
        console.log(data);

        if (socket.type !== 'remote' || screenSocket === undefined) {
            return;
        }

        var screenAction = null;
        switch (data.action) {
            case 'tap':
                screenAction = 'enter';
                break;

            case 'swipeLeft':
                screenAction = 'goLeft';
                break;

            case 'swipeRight':
                screenAction = 'goRight';
                break;
        }

        if (screenAction) {
            screenSocket.emit('controlling', {
                action: screenAction
            });
        }
    });

    socket.on('video', function(data) {
        var id = data.video_id,
            url = 'http://www.youtube.com/watch?v=' + id;
        new runShell('youtube-dl', ['-o','%(id)s.%(ext)s','-f','/18/22',url],
            function(me, buffer) {
                var output = buffer.toString();
                socket.emit('loading', {
                    output: output
                });
                console.log(output);
            },
            function() {
                omx.start(id + '.mp4');
            }
        );
    });
});
