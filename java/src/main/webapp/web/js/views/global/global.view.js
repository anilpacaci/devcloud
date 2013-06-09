define(['jquery', 'backbone', 'marionette', 'ace', 'text!templates/global/global.template.html', 'js/models/editor/file.model', 'js/views/editor/editor.view', 'jquery_cookie'], function($, Backbone, Marionette, ace, GlobalTemplate, FileModel, EditorView) {
	var GlobalView = Marionette.ItemView.extend({
		template : GlobalTemplate,
		className : '',
		initialize : function() {
			var self = this;
			var vent = this.options.vent;
			user = this.options.user;
		},
		events : {
			'click a' : 'itemClicked'
		},
		onRender : function() {
			var self = this;
			var vent = this.options.vent;
			var socket = this.options.socket;
			//this event is triggered when a single file saved to update type navigator
			this.bindTo(vent, 'global:update', function(path) {
				socket.emit('global:parse', path);
			});
			socket.on('global:tags', function(tags) {
				//old types are removed
				self.$('a').parent().remove();
				$(tags).each(function(index) {
					var item = tags[index];
					if(!item.name || !item.line || !item.path || !item.type) {
						return;
					}
					self.$('ul').append('<li><a href="#" line=' + item.line + ' path="' + item.path + '"">' + item.name + ' - ' + item.type + '</a></li>');
				});

			});

			var activeFilePath = $('li.active>a').attr('path');
			if (activeFilePath) {
				vent.trigger('global:update', activeFilePath);
			}
		},
		// callback when an item on type navigator is clicked
		itemClicked : function(e) {
			var self = this;
			var vent = this.options.vent;
			var lineNumber = $(e.target).attr('line');
			var path = $(e.target).attr('path');

			vent.trigger('editor:gotoLine', path, lineNumber);
		}
	});
	return GlobalView;
});
