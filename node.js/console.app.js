var io = require('socket.io').listen(8081),
    pty = require('pty.js');

process.title = 'tty.js test';

var buff = [],
    socketList = [],
    socket;

io.sockets.on('connection', function(socket) {
  var term = pty.fork(process.env.SHELL || 'sh', [], {
    name: 'xterm',
    cols: 80,
    rows: 10,
    cwd: process.env.HOME
  });

  term.on('data', function(data) {
    return !socket ? buff.push(data) : socket.emit('data', data);
  });

  console.log('Created shell with pty master/slave pair (master: %d, pid: %d)', term.fd, term.pid);

  // socket = sock
  socketList.push(socket);

  socket.on('data', function(data) {
    term.write(data);
  });

  socket.on('disconnect', function() {
    // socket = null;
    term.destroy();
    var index = socketList.indexOf(socket);
    socketList.splice(index, 1);
  });

  while(buff.length) {
    socket.emit('data', buff.shift());
  }
});
