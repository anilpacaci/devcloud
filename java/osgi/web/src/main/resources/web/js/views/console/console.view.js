define(['jquery', 'backbone', 'marionette', 'socketio', 'term' , 'text!templates/console/console.template.html'], function($, Backbone, Marionette, io, Terminal, ConsoleTemplate) {
	var ConsoleView = Marionette.ItemView.extend({
		template : ConsoleTemplate,
		className : '',

		initalize : function() {
			vent = this.options.vent;
			_this = this;
			this.bindTo(vent, 'terminal:focused', function(id) {
				if(_this.terminal && id == _this.terminal_id) {
					_this.terminal.focus();
				}
			});
			this.bindTo(vent, 'terminal:unfocused', function() {
				if(_this.terminal) {
					_this.terminal.unfocus();
				}
			});
			this.bindTo(vent, 'terminal:destroy', function() {
				if(_this.terminal) {
					_this.socket.emit('destroy_terminal', {id: _this.terminal_uuid});
					_this.terminal.destroy();
					_this.terminal = null;
				}
			})
		},

		onRender : function() {
			var _this = this;

			this.terminal = null;
			this.terminal_uuid = null;//new Terminal(80,20);
			
			this.socket = this.options.socket;
			this.user = this.options.user;
			this.terminal_id = this.options.id;

			var width = 120;
			var height = 20;
			this.socket.on('create_terminal_response', function(data) {
				if(!_this.terminal) {
					_this.terminal = new Terminal(width,height);
					_this.terminal_uuid = data.id;

					_this.terminal.open(_this.$('#console').get(0));

					_this.terminal.on('data', function(data) {
						_this.socket.emit('data', {id: _this.terminal_uuid, data: data});
					});

					_this.socket.on('data', function(data) {
						if(_this.terminal_uuid == data.id) {
							_this.terminal.write(data.data);
						}
					});

					_this.terminal.unfocus();
				}
			})

			this.socket.emit('create_terminal', {path: this.user.get('workspacePath'), width: width, height: height});

			// this.socket.on('connect', function {
			// 	_this.socket.emit('create_terminal')
			// });
			// var _this = this;

			// this.socket.on('connect', function() {
			// 	_this.terminal.on('data', function(data) {
			// 		_this.socket.emit('data', data);
			// 	});

			// 	_this.terminal.open(_this.$('#console').get(0));
			// 	_this.socket.on('data', function(data) {
			// 		_this.terminal.write(data);
			// 	});

			// 	_this.terminal.unfocus();
			// });
			this.initalize();
		},

		// saveButton : function() {
		// 	$.ajax({
		// 		type : "POST",
		// 		url : "http://localhost:8080/devcloud/save",
		// 		data : {
		// 			filename : this.$('#filename').val(),
		// 			content : this.editor.getValue(),
		// 			username : $.cookie('username')
		// 		},
		// 		success : function() {
		// 		}
		// 	});
		// }
	});
	return ConsoleView;
});