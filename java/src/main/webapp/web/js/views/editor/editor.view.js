define(['jquery', 'backbone', 'marionette', 'ace', 'bootbox', 'text!templates/editor/editor.template.html', 'js/models/editor/file.model', 'js/views/execution/run.view'], function($, Backbone, Marionette, ace, bootbox, EditorTemplate, FileModel, RunView) {
	var EditorView = Marionette.ItemView.extend({
		template : EditorTemplate,
		className : '',
		events : {
			'click a[id="save_button"]' : 'saveButton',
			'click a[id="run_button"]' : 'runButton',
			'click a[id="addExpression"]' : 'addExpression',
			'click a[class="removeExpression"]' : 'removeExpression'
		},
		initialize : function() {
			vent = this.options.vent;
			this.breakpoints = [];

			var self = this;

			this.bindTo(vent, 'editor:gotoLine', function(lineNumber) {
				self.editor.gotoLine(lineNumber);
			});

			this.bindTo(vent, 'file:save', function(uuid) {
				if (uuid == self.model.get('uuid')) {
					self.save(self.model);
					//this event is triggered when type navigator needs to be upated
					vent.trigger('global:update', self.model.get('path'));
				}
			});

			this.bindTo(vent, 'file:saveAll', function() {
				self.save(self.model);
			});

			this.bindTo(vent, 'file:run', function(uuid) {
				if (uuid == self.model.get('uuid')) {
					self.run(self.model);
				}
			});

			this.bindTo(vent, 'file:debug', function(uuid) {
				if (uuid == self.model.get('uuid')) {
					self.debug(self.model);
				}
			});
			// this event removes this view from app, so all event bindings are removed
			this.bindTo(vent, 'file:close', function(uuid) {
				if (uuid == self.model.get('uuid')) {
					self.remove();
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
			this.bindTo(vent, 'menu:findReplace', function(uuid) {
				if (uuid == self.model.get('uuid')) {
					self.findReplace(self.editor);
				}
			});
			this.bindTo(vent, 'menu:findReplaceAll', function(uuid) {
				if (uuid == self.model.get('uuid')) {
					self.findReplaceAll(self.editor);
				}
			});
		},
		modelEvents : {
			"change" : "modelChanged"
		},
				onRender : function() {
			var self = this;
			var vent = this.options.vent;

			if (self.model.get('path')) {
				//this event is triggered when type navigator needs to be upated
				vent.trigger('global:update', self.model.get('path'));
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

			self.editor.commands.addCommand({
				name : 'saveFile',
				bindKey : {},
				exec : function(editor) {
					self.save(self.model);
				},
				readOnly : true
			});
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

			var tempFunction = function(self, file, newFile) {
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
						bootbox.alert("An error occured");
					}
				});
			};

			if (!file.get('fileName')) {
				bootbox.prompt('Enter path to save file:', function(path) {
					path = self.options.user.get('email') + '/' + path;
					file = new FileModel({
						path : path
					});
					newFile = true;
					tempFunction(self, file, newFile);
				});

			} else {
				tempFunction(self, file, newFile);
			}

		},
		runButton : function(e) {
			this.run(this.model);
		},
		run : function(file) {
			if (!file)
				return;
			var path = file.get('path');
			if (path == '' || path.substring(path.length - 2, path.length) != '.c') {
				bootbox.alert('This file type is not supported currently.');
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
		addExpression : function() {
			bootbox.prompt('Enter an expression', function(expression) {
				if (expression) {
					$('#debugExpressions').append("<tr><td>" + expression + "</td><td>...</td><td><a href=\"#\" class=\"removeExpression\" name=\"" + expression + "\">-</a></td></tr>")
					socket.emit('debugger:add_expression', {
						id : socket.debugger_id,
						expression : expression
					});
				} else {
					bootbox.alert('Not a valid expression');
				}
			});
		},
		removeExpression : function(e) {
			var expr = e.target.name;
			$(e.target).parent().parent().remove();
			socket.emit('debugger:remove_expression', {
				id : socket.debugger_id,
				expression : expr
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
		findReplace : function(editor) {
			bootbox.prompt('Find', function(needle) {
				if (needle) {
					bootbox.prompt('Replacement', function(replacement) {
						if (replacement) {
							editor.replace(replacement, {
								needle : needle
							});
						} else {
							return;
						}
					})
				} else {
					bootbox.alert('Not a valid search string!');
				}
			});
		},
		findReplaceAll : function(editor) {
			bootbox.prompt('Find', function(needle) {
				if (needle) {
					bootbox.prompt('Replacement', function(replacement) {
						if (replacement) {
							editor.replaceAll(replacement, {
								needle : needle
							});
						} else {
							return;
						}
					})
				} else {
					bootbox.alert('Not a valid search string!');
				}
			});
		}
	});
	return EditorView;
});
