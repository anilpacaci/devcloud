var io = require('socket.io').listen(8081),
    pty = require('pty.js'),
    uuid = require('node-uuid');

process.title = 'tty.js test';

var buff = [],
    socketList = [],
    socket;

io.sockets.on('connection', function(socket) {
  socket.terminals = [];

  socket.on('create_terminal', function(data) {
    var terminal_id = uuid.v4();
    var path = data.path;
    if(!path)
      path = process.env.PWD;
    console.log('create_terminal request:\n' + JSON.stringify(data) + '\n');
    var term = pty.fork(process.env.SHELL || 'sh', [], {
      name: 'xterm',
      cols: 80,
      rows: 20,
      cwd: path//process.env.PWD
    });

    term.on('data', function(data) {
      socket.emit('data', {id: terminal_id, data: data});
    });

    socket.terminals.push({id: terminal_id, term: term});

    socket.emit('create_terminal_response', {id: terminal_id});
  });

  socket.on('destroy_terminal', function(data) {
    var terminal_id = data.id;
    for(var i=0; i<socket.terminals.length; i++) {
      if(terminal_id == socket.terminals[i].id) {
        socket.terminals[i].term.destroy();
        socket.terminals.splice(i, 1);
        break;
      }
    }
  });

  socket.on('data', function(data) {
    var terminal_id = data.id;
    var terminal_data = data.data;
    for(var i=0; i<socket.terminals.length; i++) {
      if(terminal_id == socket.terminals[i].id) {
        socket.terminals[i].term.write(data);
        break;
      }
    }
  });

  socket.on('disconnect', function() {
    for(var i=0; i<socket.terminals.length; i++) {
      socket.terminals[i].term.destroy();
    }
    var index = socketList.indexOf(socket);
    socketList.splice(index, 1);
  });


  socketList.push(socket);
  /*var term = pty.fork(process.env.SHELL || 'sh', [], {
    name: 'xterm',
    cols: 80,
    rows: 20,
    cwd: '../java/osgi/'//process.env.PWD
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
  }*/
});
