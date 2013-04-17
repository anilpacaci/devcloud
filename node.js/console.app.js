var io = require('socket.io').listen(8081),
pty = require('pty.js'),
uuid = require('node-uuid'),
sys = require('sys'),
mysql = require('mysql');

var pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'devcloud'
});

function checkSession(socket) {
	pool.getConnection(function(err,connection) {
		connection.query("SELECT * FROM Session s WHERE s.sessionID = ?", [socket.handshake.query.sessionID], function(err, results) {
			if(!err && results && results.length > 0) {
				socket.sessionExists = true;
				console.log(results.length + ": " + JSON.stringify(results));
			} else {
				socket.sessionExists = false;
				console.log(err);
			}
		})
	});

}

process.title = 'tty.js test';

var buff = [],
socketList = [],
socket;

io.sockets.on('connection', function(socket) {
	socket.sessionExists = false;
	checkSession(socket);
	socket.terminals = [];
	socket.debuggers = [];

	socket.on('create_terminal', function(data) {
		if(!socket.sessionExists) {
			return;
		}
		var terminal_id = uuid.v4();
		var path = data.path;
		var width = data.width;
		var height = data.height;

		if(!path)
			path = process.env.PWD;
		if(!width)
			width = 100;
		if(!height)
			height = 20;
		console.log('create_terminal request:\n' + JSON.stringify(data) + '\n');
		var term = pty.fork(process.env.SHELL || 'sh', [], {
			name: 'xterm',
			cols: width,
			rows: height,
		cwd: path//process.env.PWD
		});

		term.on('data', function(data) {
			socket.emit('data', {id: terminal_id, data: data});
		});

		socket.terminals.push({id: terminal_id, term: term});

		socket.emit('create_terminal_response', {id: terminal_id});
	});

	socket.on('create_process', function(data) {
		if(!socket.sessionExists) {
			return;
		}
		var process_id = uuid.v4();
		var path = data.path;
		var width = data.width;
		var height = data.height;

		if(!path)
			return;
		if(!width)
			width = 100;
		if(!height)
			height = 20;
		console.log('create_process request:\n' + JSON.stringify(data) + '\n');
		var term = pty.fork(path, [], {
			name: 'xterm',
			cols: width,
			rows: height,
			cwd: path.substring(0, path.lastIndexOf('/'))+'/'//process.env.PWD
		});

		term.on('data', function(data) {
			socket.emit('data', {id: process_id, data: data});
		});

		socket.terminals.push({id: process_id, term: term});

		socket.emit('create_process_response', {id: process_id});
	});

	socket.on('build_process', function(data) {
		if(!socket.sessionExists) {
			return;
		}
		var path = data.path;
		var width = data.width;
		var height = data.height;

		if(!path)
			return;
		if(!width)
			width = 100;
		if(!height)
			height = 20;
		console.log('build_process request:\n' + JSON.stringify(data) + '\n');
		var exec = require('child_process').exec;

		exec("gcc -g " + path, {cwd:path.substring(0, path.lastIndexOf('/'))}, function (error, stdout, stderr) {
			socket.emit('build_response', {output: stdout, error: error, stderr: stderr});
		});
	});

	socket.on('debugger:create', function(data) {
		if(!socket.sessionExists) {
			return;
		}

		var debugger_id = uuid.v4();
		var executable = data.executable;
		var params = data.params;

		if(!executable) {
			return;
		}

		console.log('create_debugger request:\n' + JSON.stringify(data) + '\n');


		var spawn = require('child_process').spawn;
		// (run_params) ? run_params.split(' ') : []
		var child = spawn("gdb", [executable] , {cwd: executable.substring(0, executable.lastIndexOf('/'))});

		socket.debuggers.push({id: debugger_id, process: child, params: params, is_running: false, breakpoints: [], expressions: []});

		child.stdin.setEncoding = 'utf-8';

		child.stdout.on('data', function(data) {
			console.log('Child process: ' + child.pid + ' ' + data + '\n');

			for(var i=0; i<socket.debuggers.length; i++) {
				var _debugger = socket.debuggers[i];
				if(_debugger.process.pid == child.pid && _debugger.is_running) {

					break;
				}
			}
		});

		child.on('close', function(code) {
			console.log('Child process closed with code: ' + code + '\n');

			for(var i=0; i<socket.debuggers.length; i++) {
				var d = socket.debuggers[i];
				if(d.process.pid == child.pid) {
					socket.debuggers.splice(i, 1);
					break;
				}
			}
		});

		console.log('debugger created id: ' + debugger_id);
		socket.emit('debugger:create_response', {id: debugger_id});
	});

	socket.on('debugger:set_breakpoint', function(data) {
		if(!socket.sessionExists) {
			return;
		}

		if(!data.id || !data.file || !data.line) {
			return;
		}

		var _debugger;

		for(var i=0; i<socket.debuggers.length; i++) {
			var d = socket.debuggers[i];
			if(d.id == data.id) {
				_debugger = d;
				break;
			}
		}

		_debugger.process.stdin.write('break ' + data.file  + ':' + data.line + '\n');

		_debugger.breakpoints.push({file: data.file, line: data.line});
	});

	socket.on('debugger:remove_breakpoint', function(data) {
		if(!socket.sessionExists) {
			return;
		}

		if(!data.id || !data.file || !data.line) {
			return;
		}

		var _debugger;

		for(var i=0; i<socket.debuggers.length; i++) {
			var d = socket.debuggers[i];
			if(d.id == data.id) {
				_debugger = d;
				break;
			}
		}

		for(var i=0; i<_debugger.breakpoints.length; i++) {
			if(_debugger.breakpoints[i].file == data.file && _debugger.breakpoints[i].line == data.line) {
				_debugger.breakpoints.splice(i, 1);

				_debugger.process.stdin.write('clear ' + data.file  + ':' + data.line + '\n');

				break;
			}
		}

	});

	socket.on('debugger:run', function(data) {
		debugger;
		if(!socket.sessionExists) {
			return;
		}

		if(!data.id) {
			return;
		}

		for(var i=0; i<socket.debuggers.length; i++) {
			var _debugger = socket.debuggers[i];
			if(_debugger.id == data.id) {
				_debugger.is_running = true;

				if(_debugger.params) {
					_debugger.process.stdin.write('run ' + _debugger.params + '\n');
				} else {
					_debugger.process.stdin.write('run\n');
				}

				return;
			}
		}
	});

	socket.on('debugger:next', function(data) {
		debugger;
		if(!socket.sessionExists) {
			return;
		}

		if(!data.id) {
			return;
		}

		for(var i=0; i<socket.debuggers.length; i++) {
			var _debugger = socket.debuggers[i];
			if(_debugger.id == data.id) {

				_debugger.process.stdin.write('next\n');

				return;
			}
		}
	});

	socket.on('debugger:continue', function(data) {
		debugger;
		if(!socket.sessionExists) {
			return;
		}

		if(!data.id) {
			return;
		}

		for(var i=0; i<socket.debuggers.length; i++) {
			var _debugger = socket.debuggers[i];
			if(_debugger.id == data.id) {

				_debugger.process.stdin.write('continue\n');

				return;
			}
		}
	});

	socket.on('destroy_terminal', function(data) {
		if(!socket.sessionExists) {
			return;
		}
		var terminal_id = data.id;
		for(var i=0; i<socket.terminals.length; i++) {
			if(terminal_id == socket.terminals[i].id) {
				socket.terminals[i].term.destroy();
				socket.terminals.splice(i, 1);
				break;
			}
		}
	});

	socket.on('destroy_process', function(data) {
		if(!socket.sessionExists) {
			return;
		}
		var terminal_id = data.id;
		debugger;
		for(var i=0; i<socket.terminals.length; i++) {
			if(terminal_id == socket.terminals[i].id) {
				socket.terminals[i].term.destroy();
				socket.terminals.splice(i, 1);
				break;
			}
		}
	});

	socket.on('data', function(data) {
		if(!socket.sessionExists) {
			return;
		}
		var terminal_id = data.id;
		var terminal_data = data.data;
		debugger;
		for(var i=0; i<socket.terminals.length; i++) {
			if(terminal_id == socket.terminals[i].id) {
				socket.terminals[i].term.write(data.data);
				break;
			}
		}
	});

	socket.on('logout', function() {
		for(var i=0; i<socket.terminals.length; i++) {
			socket.terminals[i].term.destroy();
		}

		socket.terminals = [];
	});

	socket.on('disconnect', function() {
		// debugger;
		for(var i=0; i<socket.terminals.length; i++) {
		socket.terminals[i].term.destroy();
	}
	socket.terminals = []
	// socket.disconnect();
	var index = socketList.indexOf(socket);
	socketList.splice(index, 1);
});


	socketList.push(socket);
});
