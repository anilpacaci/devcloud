define(['jquery', 'backbone', 'marionette', 'socketio', 'term' , 'text!templates/console/console.template.html'], function($, Backbone, Marionette, io, Terminal, ConsoleTemplate) {
	var ConsoleView = Marionette.ItemView.extend({
		template : ConsoleTemplate,
		className : '',

		initalize : function() {
			vent = this.options.vent;
			_this = this;
			this.bindTo(vent, 'terminal:focused', function() {
				if(_this.terminal) {
					_this.terminal.focus();
				}
			})
			this.bindTo(vent, 'terminal:unfocused', function() {
				if(_this.terminal) {
					_this.terminal.unfocus();
				}
			})
		},

		onRender : function() {
			this.terminal = new Terminal(80,24);
			this.socket = io.connect('http://localhost:8081/');

			var _this = this;

			this.socket.on('connect', function() {
				_this.terminal.on('data', function(data) {
					_this.socket.emit('data', data);
				});

				_this.terminal.open(_this.$('#console').get(0));
				_this.socket.on('data', function(data) {
					_this.terminal.write(data);
				});

				_this.terminal.unfocus();
			});
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