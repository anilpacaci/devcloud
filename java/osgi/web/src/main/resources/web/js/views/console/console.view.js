define(['jquery', 'backbone', 'marionette', 'socketio', 'term' , 'text!templates/console/console.template.html'], function($, Backbone, Marionette, io, Terminal, ConsoleTemplate) {
	var ConsoleView = Marionette.ItemView.extend({
		template : ConsoleTemplate,
		className : '',
		onRender : function() {
			this.terminal = new Terminal(80,10);
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

			});
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