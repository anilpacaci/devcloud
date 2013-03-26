define(['jquery', 'backbone', 'marionette', 'text!templates/main/main.template.html', 'js/views/editor/editor.view', 'js/views/console/console.view', 'js/views/explorer/file.explorer.view'], function($, Backbone, Marionette, MainTemplate, EditorView, ConsoleView, FileExplorerView) {
	MainLayout = Backbone.Marionette.Layout.extend({
		template : MainTemplate,

		regions : {
			editor : "#editorRegion",
			// terminal : "#terminalRegion",
	//		menu : "#menu",
			fileTree : '#fileTreeRegion',
	//		topMenu : "#menu" 
			// tabs : '#tabs'
		},

		events : {
			'shown a[data-toggle="tab"]' : 'tabShown',
			'click a[id="new_terminal_button"]' : 'addNewTerminal',
			'click .icon-remove' : 'removeTab',
			'click .icon-check' : 'saveFile2',
		//	'click #menuNewFile' : 'testAlert',	
			'click #menuSave' : 'saveFile2',
			'click #menuSaveAll' : 'saveAllFiles',
			'click #menuClose' : 'menuRemoveTab',
			'click #menuOpenNewTerminal' : 'addNewTerminal',
			'click #menuRun' : 'run',
			'click #saveOptionsButton' : 'saveOptions',
			'change #themeSelector' : 'themeSelected'
			
				
				
		},

		onRender : function() {
			vent = this.options.vent;
			user = this.options.user;
			configuration = this.options.configuration;
			socket = this.options.socket;
			this.fileTree.show(new FileExplorerView({
				vent : vent,
				configuration : configuration,
				user : user,
				socket : socket
			}));
			this.editor.show(new EditorView({
				vent : vent,
				configuration : configuration,
				socket : socket,
				user : user
			}));
/*			this.menu.show(new TopMenuView({
				vent : vent,
				user : user,
				socket : socket
			}));
*/
			this.terminal_count = 0;

			this.bindTo(vent, 'main:logout', function() {
				vent.trigger('terminal:unfocused');
				vent.trigger('process:unfocused');
				vent.trigger('process:destroy');
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
			if (!socket || !socket.socket.connected)
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
			if (id.substring(0, id.length - 1) == '#terminalRegion') {
				var terminal_id = id.substring(id.length - 1, id.length);
				this.options.vent.trigger('terminal:unfocused');
				this.options.vent.trigger('terminal:destroy', terminal_id);
			} else if(id.substring(0, 'processRegion'.length+1) == '#processRegion') {
				var process_id = id.substring('processRegion'.length+1, id.length);
				this.options.vent.trigger('process:unfocused');
				this.options.vent.trigger('process:destroy', process_id);
			}
			$(e.currentTarget).parent().remove();
			$(id).remove();
		},
		menuRemoveTab : function(e) {
			var id =  $("ul#tabs li.active a").attr('href');
			if (id.substring(0, id.length - 1) == '#terminalRegion') {
				var terminal_id = id.substring(id.length - 1, id.length);
				this.options.vent.trigger('terminal:unfocused');
				this.options.vent.trigger('terminal:destroy', terminal_id);
			} else if(id.substring(0, 'processRegion'.length+1) == '#processRegion') {
				var process_id = id.substring('processRegion'.length+1, id.length);
				this.options.vent.trigger('process:unfocused');
				this.options.vent.trigger('process:destroy', process_id);
			}
			$("ul#tabs li.active").remove();
			$(id).remove();
		},
		saveFile : function(e) {
//			alert(e.currentTarget);
//			var id = $(e.currentTarget).parent().attr('href');
//			alert(id.constructor);
//			$(id + " button").click();
//			this.fileTree.currentView.render();
		},
		saveFile2 : function(e) {
			var activeTab = $("ul#tabs li.active").text();
			alert($("ul#tabs li.active").parent());
			var v = this.options.vent;
			v.trigger('file:save', activeTab);
		},
		saveAllFiles : function(e) {
			var v = this.options.vent;
			v.trigger('file:saveAll');
		},
		run : function(e) {
			var activeTab =  $("ul#tabs li.active").text();
			var v = this.options.vent;
			v.trigger('file:run', activeTab);
		},
		themeSelected : function(e) {
			this.selectedTheme = e.currentTarget.value;
		},
		saveOptions: function(e) {
			this.options.configuration.set("themeName", this.selectedTheme);
			var self = this;
				$.ajax({
					type : 'PUT',
					url : URL + 'configuration/',
					headers : {
						"Content-Type" : "application/json"
					},
					data : JSON.stringify(self.options.configuration.toJSON()),
					success : function(response) {
						$("#optionsModal").modal("hide");
					},
					error : function(error) {
						
					}
				});
		}
	});

	return MainLayout;
});
