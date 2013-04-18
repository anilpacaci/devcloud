define(['jquery', 'backbone', 'marionette', 'ace', 'text!templates/editor/editor.template.html', 'js/models/editor/file.model', 'js/views/execution/run.view'], function($, Backbone, Marionette, ace, EditorTemplate, FileModel, RunView) {
	var EditorView = Marionette.ItemView.extend({
		template : EditorTemplate,
		className : '',
		events : {
			'click a[id="save_button"]' : 'saveButton',
			'click a[id="run_button"]' : 'runButton',
			'dblclick .ace_gutter-cell' : 'setBreakpoint'
		},
		initialize : function() {
			vent = this.options.vent;
			this.breakpoints = [];

			this.bindTo(vent, 'editor:open', function(file) {
				//alert(file);
				this.model = file;
				//	currentTab = this;
			});

			var self = this;

			this.bindTo(vent, 'file:save', function(tabName) {
				var tabNameSplitted = tabName.split(' ');
				if (tabName.trim() == self.model.get('fileName') || self.el.parentElement.id == 'editorRegion' + tabNameSplitted[tabNameSplitted.length - 1]) {
					self.save(self.model);
				}
			});

			this.bindTo(vent, 'file:saveAll', function() {
				self.save(self.model);
			});

			this.bindTo(vent, 'file:run', function(tabName) {
				if (tabName.trim() == self.model.get('fileName')) {
					self.run(self.model);
				}
			});

			this.bindTo(vent, 'file:debug', function(tabName) {
				if (tabName.trim() == self.model.get('fileName')) {
					self.debug(self.model);
				}
			});
			this.bindTo(vent, 'menu:undo', function() {
				self.undo(self.editor);
			});
			this.bindTo(vent, 'menu:redo', function() {
				self.redo(self.editor);
			});
			this.bindTo(vent, 'menu:cut', function() {
				self.cut(self.editor);
			});
			this.bindTo(vent, 'menu:copy', function() {
				self.copy(self.editor);
			});
			this.bindTo(vent, 'menu:paste', function() {
				self.paste(self.editor);
			});
			this.bindTo(vent, 'menu:findReplace', function() {
				self.findReplace(self.editor);
			});
			this.bindTo(vent, 'menu:findReplaceAll', function() {
				self.findReplaceAll(self.editor);
			});
		},
		modelEvents : {
			"change" : "modelChanged"
		},
		setBreakpoint : function(e) {
			var self = this;
			bpList = this.breakpoints;
			e.stopPropagation();
			e.preventDefault();
			var id = $(e.target).text();
			if ($(e.target).hasClass('ace_breakpoint')) {
				bpList.splice($.inArray(id, bpList), 1);
				$(e.target).removeClass('ace_breakpoint');
				if (!self.inDebug) {
					socket.emit('debugger:remove_breakpoint', {
						'file' : self.model.get('fileName'),
						'line' : id,
						'id' : self.debugID
					});
				}
			} else {
				bpList.push(id);
				$(e.target).addClass('ace_breakpoint');
				if (self.inDebug) {
					socket.emit('debugger:set_breakpoint', {
						'file' : self.model.get('fileName'),
						'line' : id,
						'id' : self.debugID
					});
				}
			}
		},
		onRender : function() {

			if (!this.model) {
				this.model = new FileModel();
			}

			vent = this.options.vent;
			configuration = this.options.configuration;
			this.editor = ace.edit(this.$('#editor').get(0));
			if (configuration) {
				this.editor.setTheme(configuration.get("themeName"));
			} else {
				this.editor.setTheme("ace/theme/monokai");
			}
			this.editor.getSession().setMode("ace/mode/c_cpp");
			this.editor.setValue(this.model.get('content'));

			// keybinding for auto completion
			var self = this;
			self.editor.commands.addCommand({
				name : 'myCommand',
				bindKey : {
					win : 'Ctrl-Space',
					mac : 'Command-Space'
				},
				exec : function(editor) {
					$('#fakeAutoComplete').offset($('.active .ace_cursor').offset());
					var cursorPosition = editor.getCursorPosition();
					var range = editor.selection.getWordRange(editor.selection.getSelectionLead());
					range.end = cursorPosition;

					var suggestionList = editor.getValue().split(/[^\w]+/);
					suggestionList = suggestionList.filter(function(elem, pos, self) {
						return self.indexOf(elem) == pos;
					});
					suggestionList = suggestionList.filter(function(e) {
						return e
					});
					var toComplete = editor.session.getTextRange(range);
					$('#fakeAutoComplete').autocomplete({
						autoFocus : true,
						source : suggestionList,
						focus : function() {
							$('#fakeAutoComplete').text('');
						},
						open : function() {
							$('.ui-menu').focus();
							$('.ui-menu').keydown(function(e) {
								if (e.keyCode == 27) {
									$('#fakeAutoComplete').autocomplete('close');
								}
							});
						},
						select : function(event, ui) {
							editor.session.replace(range, ui.item.value);
						},
						close : function() {
							$('#fakeAutoComplete').text('');
							$('.ace_text-input').focus();
						}
					});
					$('#fakeAutoComplete').autocomplete('search', toComplete);
					$('.ui-menu').css('width', '');
				},
				readOnly : true // false if this command should not apply in readOnly mode
			});

			//currentTab = this;//.model;

		},
		modelChanged : function() {
			this.editor.setValue(this.model.get('content'));
		},
		saveButton : function(e) {
			this.save(this.model);
		},
		save : function(file) {
			var self = this;
			var newFile = false;
			if (!file.get('fileName')) {
				var path = prompt('Enter path to save file:', 'path to save');
				path = this.options.user.get('email') + '/' + path;
				file = new FileModel({
					path : path
				});
				newFile = true;
			}
			file.set('content', self.editor.getValue());
			$.ajax({
				type : "POST",
				url : URL + 'fileResource',
				data : {
					path : file.get('path'),
					content : file.get('content')
				},
				success : function(absPath) {
					if (newFile) {
						file.set('path', absPath);

						var pathElements = file.get('path').split("/");
						var fileName = pathElements[pathElements.length-1].split('.')[0];
						var v = self.options.vent;

						self.model = file;

						var editorRegionId = $("ul#tabs li.active")[0].children[0].href.split('#')[1];
						$("ul#tabs li.active")[0].children[0].href = '#editorRegion' + fileName;
						$('#' + editorRegionId)[0].id = 'editorRegion' + fileName;
						$("ul#tabs li.active")[0].children[0].innerHTML = pathElements[pathElements.length - 1] + " <i class='icon-remove'></i>"
						v.trigger('explorer:refresh', file.get('path'));
					}
				},
				error : function() {
					alert("An error occured");
				}
			});
		},
		runButton : function(e) {
			this.run(this.model);
		},
		run : function(file) {
			if (!file)
				return;
			var path = file.get('path');
			if (path == '' || path.substring(path.length - 2, path.length) != '.c') {
				alert('This file type is not supported currently.');
				return;
			}
			if (!socket || !socket.socket.connected)
				return;
			var runView = new RunView({
				vent : vent,
				user : user,
				socket : socket,
				path : path
			});
			runView.render();

		},
		debug : function(file) {
			if (this.inDebug) {return;};
			var executableName = prompt("Enter executable name:");
			if(!executableName) return;
			var self = this;
			if (!file)
				return;
			var path = file.get('path');
			if (path == '' || path.substring(path.length - 2, path.length) != '.c') {
				alert('This file type is not supported currently.');
				return;
			}
			if (!socket || !socket.socket.connected)
				return;

			var pathArray = path.split('/');
			pathArray.pop();
			pathArray.push(executableName);
			path = pathArray.join('/');
			socket.emit('debugger:create', {
				'executable' : path
			});
			socket.on('debugger:create_response', function(data) {
				self.debugID = data.id;
				self.inDebug = true;
			});

			var breakpoints = this.breakpoints;
			for ( i = 0; i < breakpoints.length; i++) {
				socket.emit('debugger:set_breakpoint', {
					'file' : self.model.get('fileName'),
					'line' : breakpoints[i],
					'id' : self.debugID
				});
			}

			socket.emit('debugger:run', {
				id : self.debugID
			});

			$('#mainMenu').append('<li id="nextButton"><a href="#" class="btn btn-primary"><i class="icon-play"></i></a></li>').append('<li id="continueButton"><a href="#" class="btn btn-primary"><i class="icon-step-forward"></i></a></li>').append('<li id="closeDebugButton"><a href="#" class="btn btn-primary"><i class="icon-remove"></i></a></li>');

			$('#nextButton').click(function(e) {
				socket.emit('debugger:next', {
					id : self.debugID
				});
			});
			$('#continueButton').click(function(e) {
				socket.emit('debugger:continue', {
					id : self.debugID
				});
			});
			$('#closeDebugButton').click(function(e) {
				$('#nextButton').remove();
				$('#continueButton').remove();
				$('#closeDebugButton').remove();
				self.inDebug = false;
			});

		},
		highlight : function(row) {
			this.editor.gotoLine(row, 0, true);
		},
		undo : function(editor) {
			editor.undo();
		},
		redo : function(editor) {
			editor.redo();
		},
		cut : function(editor) {
			//	        var range = editor.getSelectionRange();
			//	        editor._emit("cut", range);
			//
			//	        if (!editor.selection.isEmpty()) {
			//	            editor.session.remove(range);
			//	            editor.clearSelection();
			//	        }
		},
		copy : function(editor) {
			//editor.onCopy();
		},
		paste : function(editor) {
			//editor.onPaste(editor.text.value);
		},
		findReplace : function(editor) {
			var needle = prompt("Find:", editor.getCopyText());
			if (!needle)
				return;
			var replacement = prompt("Replacement:");
			if (!replacement)
				return;
			editor.replace(replacement, {
				needle : needle
			});
		},
		findReplaceAll : function(editor) {
			var needle = prompt("Find:");
			if (!needle)
				return;
			var replacement = prompt("Replacement:");
			if (!replacement)
				return;
			editor.replaceAll(replacement, {
				needle : needle
			});
		}
	});
	return EditorView;
});
