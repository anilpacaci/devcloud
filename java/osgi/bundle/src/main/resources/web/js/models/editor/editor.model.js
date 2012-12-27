define(['jquery', 'backbone', 'ace'], function($, Backbone, Ace) {
	var EditorModel = Backbone.Model.extend({
		initalize : function() {
			this.editor = Ace.edit(editor);
			editor.setTheme("ace/theme/monokai");
			editor.getSession().setMode("ace/mode/javascript");
		}
	});

	return EditorModel;
});
