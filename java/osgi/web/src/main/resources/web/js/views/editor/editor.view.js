define(['jquery', 'backbone', 'marionette', 'ace', 'text!templates/editor/editor.template.html', 'js/models/editor/file.model'], function($, Backbone, Marionette, ace, EditorTemplate, FileModel) {
	var EditorView = Marionette.ItemView.extend({
		template : EditorTemplate,
		className : '',
		events : {
			'click button' : 'saveButton'
		},
		initalize : function() {
			vent = this.options.vent;
			this.bindTo(vent, 'editor:open', function(file) {
				alert(file);
				this.model = file;
			})
		},
		onRender : function() {
		
			if(!this.model) {
				this.model = new FileModel();
			}
		
			vent = this.options.vent;
			this.editor = ace.edit(this.$('#editor').get(0));
			this.editor.setTheme("ace/theme/monokai");
			this.editor.getSession().setMode("ace/mode/c_cpp");
			this.editor.setValue(this.model.get('content'));
		},

		saveButton : function() {
			$.ajax({
				type : "POST",
				url : "http://localhost:8080/devcloud/fileResource",
				data : {
					filename : this.$('#filename').val(),
					content : this.editor.getValue(),
					username : $.cookie('username')
				},
				success : function() {
				}
			});
		}
	});
	return EditorView;
});
