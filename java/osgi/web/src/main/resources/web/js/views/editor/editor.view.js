define(['jquery', 'backbone', 'marionette', 'ace', 'text!templates/editor/editor.template.html', 'js/models/editor/file.model', 'js/views/execution/run.view'], function($, Backbone, Marionette, ace, EditorTemplate, FileModel, RunView) {
	var EditorView = Marionette.ItemView.extend({
		template : EditorTemplate,
		className : '',
		events : {
			'click button' : 'saveButton',
			'click a[id="run_button"]' : 'run'
		},
		initalize : function() {
			vent = this.options.vent;
			this.bindTo(vent, 'editor:open', function(file) {
				alert(file);
				this.model = file;
			})
		},
		modelEvents : {
			"change" : "modelChanged"
		},
		onRender : function() {

			if (!this.model) {
				this.model = new FileModel();
			}

			vent = this.options.vent;
			this.editor = ace.edit(this.$('#editor').get(0));
			this.editor.setTheme("ace/theme/monokai");
			this.editor.getSession().setMode("ace/mode/c_cpp");
			this.editor.setValue(this.model.get('content'));
		},
		modelChanged : function() {
			this.editor.setValue(this.model.get('content'));
		},

		saveButton : function() {
			var file = this.model;
			if (!file.get('fileName')) {
				var path = prompt('Enter path to save file:', 'path to save');
				path = this.options.user.get('email') + '/' + path;
				file = new FileModel({
					path : path
				});
			}
			file.set('content', this.editor.getValue());
			$.ajax({
				type : "POST",
				url : "http://localhost:8080/devcloud/fileResource",
				data : {
					path : file.get('path'),
					content : file.get('content')
				},
				success : function() {
				}
			});
		},
		run : function(e) {
			var file = this.model;
			if(!file)
				return;
			var path = file.get('path');
			if(path == '' || path.substring(path.length-2, path.length) != '.c') {
				alert('This file type is not supported currently.');
				return;
			}
			if(!socket || !socket.socket.connected)
				return;
			var runView = new RunView({
				vent : vent,
				user : user,
				socket : socket,
				path : path
			});
			runView.render();
		}
	});
	return EditorView;
});
