define(['jquery', 'backbone', 'marionette', 'text!templates/main/main.template.html', 'js/views/editor/editor.view', 'js/views/console/console.view', 'js/views/explorer/file.explorer.view'], function($, Backbone, Marionette, MainTemplate, EditorView, ConsoleView, FileExplorerView) {
	MainLayout = Backbone.Marionette.Layout.extend({
		template : MainTemplate,

		regions : {
			editor : "#editorRegion",
			// terminal : "#terminalRegion",
			menu : "#menu",
			fileTree : '#fileTreeRegion',
			// tabs : '#tabs'
		},

		events : {
			'shown a[data-toggle="tab"]' : 'tabShown',
			'click a[id="new_terminal_button"]' : 'addNewTerminal',
			'click .icon-remove' : 'removeTab',
			'click .icon-check' : 'saveFile'
		},

		onRender : function() {
			vent = this.options.vent;
			user = this.options.user;
			socket = this.options.socket;
			this.fileTree.show(new FileExplorerView({
				vent : vent,
				user : user,
				socket : socket
			}));
			this.editor.show(new EditorView({
				vent : vent,
				socket : socket
			}));
			this.terminal_count = 0;

			this.bindTo(vent, 'main:logout', function() {
				vent.trigger('terminal:unfocused');
				vent.trigger('terminal:destroy');
			})
			// this.terminal.show(new ConsoleView({
			// 	vent : vent,
			// 	user : user,
			// 	socket : socket
			// }));
		},

		tabShown : function(e) {
			if (e.target.hash.slice(0, e.target.hash.length - 1) == '#terminalRegion') {
				this.options.vent.trigger('terminal:focused', e.target.hash[e.target.hash.length - 1]);
			} else {
				this.options.vent.trigger('terminal:unfocused');
			}
		},

		addNewTerminal : function(e) {
			if(!socket || !socket.socket.connected)
				return;
			if (this.terminal_count < 5) {
				$('#tabs').append('<li class><a href="#terminalRegion' + this.terminal_count + '" data-toggle="tab">Terminal ' + this.terminal_count + '<i class="icon-remove"></i></a></li>');
				$('#tab_content').append('<div class="tab-pane fade" id="terminalRegion' + this.terminal_count + '"></div>');

				var consoleView = new ConsoleView({
					vent : vent,
					user : user,
					socket : socket,
					id : this.terminal_count
				});
				consoleView.render();
				$('#terminalRegion' + this.terminal_count).append(consoleView.el);
				this.terminal_count++;
			} else {
				alert("You can not create more than 5 terminals.")
			}
		},
		removeTab : function(e) {
			var id = $(e.currentTarget).parent().attr('href');
			if(id.substring(0, id.length-1) == '#terminalRegion') {
				var terminal_id = id.substring(id.length-1, id.length);
				this.options.vent.trigger('terminal:unfocused');
				this.options.vent.trigger('terminal:destroy', terminal_id);
			}
			$(e.currentTarget).parent().remove();
			$('#' + id).remove();
		},
		saveFile : function(e) {
			var id = $(e.currentTarget).parent().attr('href');
			$(id + " button").click();
		}
	});

	return MainLayout;
});
