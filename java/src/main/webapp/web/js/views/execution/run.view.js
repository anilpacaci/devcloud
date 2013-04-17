define(['jquery', 'backbone', 'marionette', 'socketio', 'term' , 'text!templates/execution/run.template.html'], function($, Backbone, Marionette, io, Terminal, RunTemplate) {
	var RunView = Marionette.ItemView.extend({
		template : RunTemplate,
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
			this.built_complete = false;
			this.socket.on('build_response', function(data) {
				if(_this.built_complete)
					return;
				if(data.stderr == null || data.stderr == '') {
					alert('Build successful.');
					_this.socket.emit('create_process', {path: path.substring(0, path.lastIndexOf('/')) + '/a.out', width: width, height: height});
				} else {
					alert(data.stderr);
				}
				_this.built_complete = true;
				_this.tab_added = false;
			});

			this.socket.on('create_process_response', function(data) {
				if(!_this.process && !_this.tab_added) {

					$('#tabs').append('<li class><a href="#processRegion' + data.id + '" data-toggle="tab">Process - ' + path.substring(path.lastIndexOf('/'), path.length) + '<i class="icon-remove"></i></a></li>');
					$('#tab_content').append('<div class="tab-pane fade" id="processRegion' + data.id + '"></div>');

					_this.process = new Terminal(width,height);
					_this.process_uuid = data.id;

					_this.process.open(_this.el.children[0].children[0]);

					$('#processRegion' + data.id).append(_this.el);

					_this.process.on('data', function(data) {
						_this.socket.emit('data', {id: _this.process_uuid, data: data});
					});

					_this.socket.on('data', function(data) {
						if(_this.process_uuid == data.id) {
							_this.process.write(data.data);
						}
					});

					_this.process.unfocus();
					_this.tab_added = true;
				}
			});

			this.socket.emit('build_process', {path: path, width: width, height: height});
			this.initalize();
		},
	});
	return RunView;
});