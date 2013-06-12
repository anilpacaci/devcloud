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
		connection.query("SELECT * FROM User u WHERE u.session_sessionID = ?", [socket.handshake.query.sessionID], function(err, results) {
			if(!err && results && results.length > 0) {
				socket.sessionExists = true;
				socket.user = results[0];
				console.log(results.length + ": " + JSON.stringify(results));
			} else {
				socket.sessionExists = false;
				socket.user = null;
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
		if(!socket.sessionExists || !socket.user) {
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
		var term = pty.fork('sudo', ['su', socket.user.email, '-c', '"sh"'], {
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
		var term = pty.fork('sudo', ['su', socket.user.email, '-c', '"'+path+'"'], {
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
		var execName = path.substring( path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
		if(!path)
			return;
		if(!width)
			width = 100;
		if(!height)
			height = 20;
		console.log('build_process request:\n' + JSON.stringify(data) + '\n');
		var exec = require('child_process').exec;

		exec("sudo su " + socket.user.email + " -c 'gcc -g " + path + " -o " + execName + "'", {cwd:path.substring(0, path.lastIndexOf('/'))}, function (error, stdout, stderr) {
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
		var child = spawn("gdb", [executable, '--interpreter=mi'] , {cwd: executable.substring(0, executable.lastIndexOf('/'))});

		socket.debuggers.push({id: debugger_id, process: child, params: params, is_running: false, breakpoints: [], expressions: []});

		child.stdin.setEncoding('utf-8');
		child.stdout.setEncoding('utf-8');

		child.stdout.on('data', function(output_lines) {
			console.log('Child process: ' + child.pid + ' ' + output_lines + '\n');

			for(var i=0; i<socket.debuggers.length; i++) {
				var _debugger = socket.debuggers[i];
				if(_debugger.process.pid == child.pid) {
					var output_lines_splitted = output_lines.split('\n');
					for(var k=0; k<output_lines_splitted.length; k++) {
						var output = output_lines_splitted[k];
						var bkpt_string = output.match('bkpt={.*}');
						if(bkpt_string && bkpt_string.length == 1) {
							var temp_string = bkpt_string[0].substring(6, bkpt_string[0].length-1);
							var attribute_list = temp_string.split(',').map(function(el){return el.split('=')});
							var attributes = {};
							for(var j=0; j<attribute_list.length; j++) {
								var attribute = attribute_list[j];
								attributes[attribute[0]] = JSON.parse(attribute[1]);
							}

							var breakpoint_added_before = false;
							for(var j=0; j<_debugger.breakpoints.length; j++) {
								if(_debugger.breakpoints[j].number == attributes.number) {
									breakpoint_added_before = true;
									break;
								}
							}

							if(!breakpoint_added_before) {
								_debugger.breakpoints.push(attributes);
							}
						}

						if(output.indexOf('*stopped,reason="exited') != -1) {
							debugger;
							socket.emit('debugger:closed',{id: _debugger.id});
							socket.debuggers.splice(i, 1);
							child.kill();
							return;
						}

						if(output.indexOf('*stopped,reason="breakpoint-hit"') != -1 || output.indexOf('*stopped, reason="end-stepping-range"') != -1) {
							// breakpoint hit

							var frame_string = output.match('frame={.*}');
							if(frame_string && frame_string.length == 1) {
								var frame = {};
								var temp_string = frame_string[0].substring(7, frame_string[0].length-1);
								var attribute_list = temp_string.split(',').map(function(el){return el.split('=')});

								for(var j=0; j<attribute_list.length; j++) {
									var attribute = attribute_list[j];
									debugger;
									try {
										frame[attribute[0]] = JSON.parse(attribute[1]);
									} catch (Error) {
									}
								}

								_debugger.frame = frame;
								_debugger.frame.pending_expression_evaluations = [];
								_debugger.frame.evaluated_expressions = {};
								for(var j=0; j<_debugger.expressions.length; j++) {
									_debugger.frame.pending_expression_evaluations.push(j);

									_debugger.process.stdin.write(j+'-data-evaluate-expression ' + _debugger.expressions[j] + '\n');
								}
							}
						}

						if(_debugger.frame) {
							if(_debugger.frame.pending_expression_evaluations.length > 0) {
								for(var j=0; j<_debugger.frame.pending_expression_evaluations.length; j++) {
									var done_string = _debugger.frame.pending_expression_evaluations[j]+'^done';
									var error_string = _debugger.frame.pending_expression_evaluations[j]+'^error';
									debugger;
									if(output.indexOf(done_string) != -1) {
										//expression is successfully evaluated.

										var value = output.substring(done_string.length + 8, output.length-1);
										_debugger.frame.evaluated_expressions[_debugger.expressions[_debugger.frame.pending_expression_evaluations[j]]] = value;

										_debugger.frame.pending_expression_evaluations.splice(j,1);
									} else if(output.indexOf(error_string) != -1) {
										//expression evaluation is resulted in an error.

										var value = output.substring(done_string.length + 6, output.length-1);
										_debugger.frame.evaluated_expressions[_debugger.expressions[_debugger.frame.pending_expression_evaluations[j]]] = value;

										_debugger.frame.pending_expression_evaluations.splice(j,1);
									}
									//output = output.substring(output.indexOf('\n'), output.length);
								}
							}

							if(_debugger.frame.pending_expression_evaluations.length == 0) {
								debugger;
								// send data to the client
								socket.emit('debugger:set_current_state', {
									file: _debugger.frame.fullname,
									line: _debugger.frame.line,
									id: _debugger.id,
									expressions: _debugger.frame.evaluated_expressions
								});

								_debugger.frame = null;
							}
						}
					}
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

		if(_debugger) {
			console.log('-break-insert ' + data.file  + ':' + data.line + '\n');
			_debugger.process.stdin.write('-break-insert ' + data.file  + ':' + data.line + '\n');
		}

		//_debugger.breakpoints.push({file: data.file, line: data.line});
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

		if(_debugger) {
			for(var i=0; i<_debugger.breakpoints.length; i++) {
				if((_debugger.breakpoints[i].file == data.file || _debugger.breakpoints[i].fullname == data.file) && _debugger.breakpoints[i].line == data.line) {

					_debugger.process.stdin.write('-break-delete ' + _debugger.breakpoints[i].number);

					_debugger.breakpoints.splice(i, 1);

					//_debugger.process.stdin.write('clear ' + data.file  + ':' + data.line + '\n');

					break;
				}
			}
		}

	});

	socket.on('debugger:run', function(data) {
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
					_debugger.process.stdin.write('-exec-run ' + _debugger.params + '\n');
				} else {
					_debugger.process.stdin.write('-exec-run\n');
				}

				return;
			}
		}
	});

	socket.on('debugger:add_expression', function(data) {
		if(!socket.sessionExists) {
			return;
		}

		if(!data.id || !data.expression) {
			return;
		}

		for(var i=0; i<socket.debuggers.length; i++) {
			var _debugger = socket.debuggers[i];
			if(_debugger.id == data.id) {
				_debugger.expressions.push(data.expression);

				return;
			}
		}
	});

	socket.on('debugger:remove_expression', function(data) {
		if(!socket.sessionExists) {
			return;
		}

		if(!data.id || !data.expression) {
			return;
		}

		for(var i=0; i<socket.debuggers.length; i++) {
			var _debugger = socket.debuggers[i];
			if(_debugger.id == data.id) {
				var index =_debugger.expressions.indexOf(data.expression);

				_debugger.expressions.splice(index, 1);

				return;
			}
		}
	});

	socket.on('debugger:next', function(data) {
		if(!socket.sessionExists) {
			return;
		}

		if(!data.id) {
			return;
		}

		for(var i=0; i<socket.debuggers.length; i++) {
			var _debugger = socket.debuggers[i];
			if(_debugger.id == data.id) {

				_debugger.frame = null;

				_debugger.process.stdin.write('-exec-next\n');

				return;
			}
		}
	});

	socket.on('debugger:continue', function(data) {
		if(!socket.sessionExists) {
			return;
		}

		if(!data.id) {
			return;
		}

		for(var i=0; i<socket.debuggers.length; i++) {
			var _debugger = socket.debuggers[i];
			if(_debugger.id == data.id) {

				_debugger.frame = null;

				_debugger.process.stdin.write('-exec-continue\n');

				return;
			}
		}
	});
	
	/*
	 *  GIT FUNCTIONS
	 */
	socket.on('git:clone', function(data) {
		if(!socket.sessionExists) {
			return;
		}
		if(!data.path && !data.url) {
			return;
		}
		
		var exec = require('child_process').exec;
		exec("cd "+ data.path + ";su " + socket.user.email + " -c 'git clone " + data.url + "'", function (error, stdout, stderr) {
			console.log('gitClone: ' + stdout);
			socket.emit('git_finished', {
				'error': error,
				'stdout': stdout,
				'stderr': stderr});
		});
	});
	
	socket.on('git:pull', function(data) {
		if(!socket.sessionExists) {
			return;
		}
		if(!data.path) {
			return;
		}
		
		var exec = require('child_process').exec;
		exec("cd "+ data.path + ";su " + socket.user.email + " -c 'git pull'", function (error, stdout, stderr) {
			console.log('gitPull: ' + stdout);
			socket.emit('git_finished', {
				'error': error,
				'stdout': stdout,
				'stderr': stderr});
		});
	});
	
	socket.on('git:push', function(data) {
		if(!socket.sessionExists) {
			return;
		}
		if(!data.path && !data.username && !data.password) {
			return;
		}
		
		var exec = require('child_process').exec;
		console.log("(echo "+data.username+" & echo "+data.password+" ) | git push");
		exec("su -c '(echo "+data.username+" & echo "+data.password+" ) | git push'", {cwd:data.path}, function (error, stdout, stderr) {
			socket.emit('git_finished', {
				'error': error,
				'stdout': stdout,
				'stderr': stderr});
		});

	});
	
	socket.on('git:commit', function(data) {
		if(!socket.sessionExists) {
			return;
		}
		if(!data.path && !data.message) {
			return;
		}
		
		var exec = require('child_process').exec;
		exec('su ' + socket.user.email + ' -c "git add .";su ' + socket.user.email + ' -c "git commit -m \"'+data.message+'\""', {cwd: data.path}, function (error, stdout, stderr) {
			socket.emit('git_finished', {
				'error': error,
				'stdout': stdout,
				'stderr': stderr});
		});
	});
	
	socket.on('git:checkout', function(data) {
		if(!socket.sessionExists) {
			return;
		}
		if(!data.path) {
			return;
		}
		
		var exec = require('child_process').exec;
		exec("su " + socket.user.email + " -c 'git checkout --theirs .'", {cwd: data.path}, function (error, stdout, stderr) {
			console.log('gitPull: ' + stdout);
			socket.emit('git_finished', {
				'error': error,
				'stdout': stdout,
				'stderr': stderr});
		});
	});
	/*
	 **********************************************************************************************
	 */
	
	socket.on('contextMenu:newFolder', function(data) {
		if(!socket.sessionExists) {
			return;
		}
		if(!data.path || !data.name) {
			return;
		}
		
		var exec = require('child_process').exec;
		exec("sudo su " + socket.user.email + " -c 'mkdir "+data.name+"'", {cwd: data.path}, function (error, stdout, stderr) {
			socket.emit('explorer_refresh', {
				'error': error,
				'stdout': stdout,
				'stderr': stderr});
		});
	});
	
	
	socket.on('contextMenu:newFile', function(data) {
		if(!socket.sessionExists) {
			return;
		}
		if(!data.path || !data.name) {
			return;
		}
		
		var exec = require('child_process').exec;
		exec("su " + socket.user.email + " -c 'touch "+data.name+"'", {cwd: data.path}, function (error, stdout, stderr) {
			socket.emit('explorer_refresh', {
				'error': error,
				'stdout': stdout,
				'stderr': stderr});
		});
	});
	
	socket.on('contextMenu:remove', function(data) {
		if(!socket.sessionExists) {
			return;
		}
		if(!data.path) {
			return;
		}
		
		var exec = require('child_process').exec;
		exec("rm -rf "+data.path, function (error, stdout, stderr) {
			socket.emit('explorer_refresh', {
				'error': error,
				'stdout': stdout,
				'stderr': stderr});
		});
	});

	socket.on('contextMenu:rename', function(data) {
		if(!socket.sessionExists) {
			return;
		}
		if(!data.path || !data.name) {
			return;
		}
		
		var newPath = data.path.substring(0,data.path.lastIndexOf("/")) + "/" + data.name;
		var exec = require('child_process').exec;
		exec("su " + socket.user.email + " -c 'mv -f "+data.path+" "+newPath+"'", function (error, stdout, stderr) {
			socket.emit('explorer_refresh', {
				'error': error,
				'stdout': stdout,
				'stderr': stderr});
		});
	});
	
	socket.on('contextMenu:build', function(data) {
		if(!socket.sessionExists) {
			return;
		}
		if(!data.path) {
			return;
		}
		
		var newPath = data.path + "/Makefile";
		var path = require('path');

		var fs = require('fs');
		fs.stat(data.path, function(err, stat) {
			if(stat.isDirectory()){
				if (path.existsSync(newPath)) {
					var exec = require('child_process').exec;
					exec("make", {cwd:data.path}, function (error, stdout, stderr) {
						socket.emit('build_finished', {
							'error': error,
							'stdout': stdout,
							'stderr': stderr});
					});
				} else{

					socket.emit('build_finished', {
						'error': "",
						'stdout': "Makefile cannot be found!",
						'stderr': ""});
				}
			} else if(stat.isFile()){
				var exec = require('child_process').exec;
				var execName = data.path.substring( data.path.lastIndexOf('/') + 1, data.path.lastIndexOf('.'));
				exec("gcc -g " + data.path + " -o " + execName, {cwd:data.path.substring(0, data.path.lastIndexOf('/'))}, function (error, stdout, stderr) {
					socket.emit('build_finished', {output: "Build successfully", error: error, stderr: stderr});
				});
			} else {
				socket.emit('build_finished',{output: "Error", error: error, stderr: stderr});
			}
		});

	});
	
	
	
	socket.on('global:parse', function(data) {
		console.log(data);
		if(!socket.sessionExists) {
			return;
		}
		if(!data) {
			return;
		}
		
		var parentFolder = "";
		var arr = data.split('/');
		arr.pop();
		for(var i=0; i<arr.length; i++){
			
			parentFolder += arr[i] + "/";	
		
		}
				
		var exec = require('child_process').exec;
		exec("cd " + parentFolder + ";gtags;" + "global -af " + data, function (error, stdout, stderr) {
			var response = [];
			var result = stdout.split('\n');
			for(i = 0 ; i < result.length ; i++) {
				var item = new Object();
				itemParameters = result[i].split(new RegExp("\\s+"));
				item.name = itemParameters[0];
				item.line = itemParameters[1];
				item.path = itemParameters[2];
				item.type = itemParameters[3];
				response.push(item);
			}
			
			
			socket.emit('global:tags', response);
		});
	});
	


	socket.on('global:searchItem', function(data) {
		console.log(data);
		if(!socket.sessionExists) {
			return;
		}
		if(!data) {
			return;
		}
		
		var parentFolder = "";
		var arr = data.path.split('/');
		arr.pop();
		for(var i=0; i<arr.length; i++){
			
			parentFolder += arr[i] + "/";	
		
		}
						
		var exec = require('child_process').exec;
		exec("cd " + parentFolder  + ";global -ax " + data.toNavigate, function (error, stdout, stderr) {
			var response;
			var result = stdout;
			
			var item = new Object();
			itemParameters = result.split(new RegExp("\\s+"));
			item.name = itemParameters[0];
			item.line = itemParameters[1];
			item.path = itemParameters[2];

			response = item;
			
			socket.emit('global:item', response);
		});
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
