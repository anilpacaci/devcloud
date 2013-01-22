define(['jquery', 'backbone', 'marionette', 'socketio', 'term' , 'text!templates/console/console.template.html'], function($, Backbone, Marionette, io, Terminal, ConsoleTemplate) {
	var RunView = Marionette.ItemView.extend({
		template : ConsoleTemplate,
		className : '',

		initalize : function() {
			vent = this.options.vent;
			_this = this;
			this.bindTo(vent, 'process:focused', function(id) {
				if(_this.process && id == _this.process_id) {
					_this.process.focus();
				}
			});
			this.bindTo(vent, 'process:unfocused', function() {
				if(_this.process) {
					_this.process.unfocus();
				}
			});
			this.bindTo(vent, 'process:destroy', function(id) {
				if(!id || (_this.process && _this.process_id == id)) {
					_this.socket.emit('destroy_process', {id: _this.process_uuid});
					_this.process.destroy();
					_this.process = null;
				}
			})
		},

		onRender : function() {
			var _this = this;

			this.process = null;
			this.process_uuid = null;//new Terminal(80,20);
			
			this.socket = this.options.socket;
			this.user = this.options.user;
			this.process_id = this.options.id;
			this.path = this.options.path;

			var path = this.path;
			var width = 120;
			var height = 20;
			this.socket.on('build_response', function(data) {
				if(data.stderr == null || data.stderr == '')
					alert('Build successful.');
				else
					alert(data.stderr);
			});

			this.socket.on('create_process_response', function(data) {
				if(!_this.process) {
					_this.process = new Terminal(width,height);
					_this.process_uuid = data.id;

					_this.process.open(_this.$('#console').get(0));

					_this.process.on('data', function(data) {
						_this.socket.emit('data', {id: _this.process_uuid, data: data});
					});

					_this.socket.on('data', function(data) {
						if(_this.process_uuid == data.id) {
							_this.process.write(data.data);
						}
					});

					_this.process.unfocus();
				}
			})

			this.socket.emit('build_process', {path: path, width: width, height: height});
			this.initalize();
		},
	});
	return RunView;
});