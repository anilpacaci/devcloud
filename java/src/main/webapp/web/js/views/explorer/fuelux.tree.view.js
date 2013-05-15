define(['jquery', 'backbone', 'marionette', 'ace', 'text!templates/explorer/fuelux.tree.template.html', 'js/models/editor/file.model', 'js/views/editor/editor.view', 'fuelux_tree', 'jquery_cookie'], function($, Backbone, Marionette, ace, FueluxTreeTemplate, FileModel, EditorView) {
	var user;
	var DataSource = function(options) {
		this._formatter = options.formatter;
		this._columns = options.columns;
		this._data = options.data;
	};

	DataSource.prototype = {

		columns : function() {
			return this._columns;
		},

		data : function(options, callback) {
			var self = this;
			var path = user.get('email');
			if (options.additionalParameters) {
				path = options.additionalParameters.filePath;
			}
			$.ajax({
				type : 'POST',
				url : URL + 'fileExplorer',
				data : {
					path : path
				},
				success : function(response) {
					callback({
						data : response,
						start : 0,
						end : 0,
						count : 0,
						pages : 0,
						page : 0
					});
					return true;
				},
				error : function(e) {
					console.log(e);
				}
			});
		}
	};

	var FueluxTreeView = Marionette.ItemView.extend({
		template : FueluxTreeTemplate,
		className : '',
		initialize : function() {
			var self = this;
			user = this.options.user;
			this.bindTo(this.options.vent, 'explorer:open', function(filePath) {
				//self.openFile(filePath);
			});
		},
		onRender : function() {
			var self = this;
			vent = this.options.vent;
			user = this.options.user;
			configuration = this.options.configuration;
			var treeDataSource = new DataSource({
				data : [{
					name : 'Test Folder 1',
					type : 'folder',
					additionalParameters : {
						id : 'F1'
					}
				}, {
					name : 'Test Folder 2',
					type : 'folder',
					additionalParameters : {
						id : 'F2'
					}
				}, {
					name : 'Test Item 1',
					type : 'item',
					additionalParameters : {
						id : 'I1'
					}
				}, {
					name : 'Test Item 2',
					type : 'item',
					additionalParameters : {
						id : 'I2'
					}
				}, {
					name : 'Test Item 3',
					type : 'item',
					additionalParameters : {
						id : 'I3'
					}
				}],
				delay : 400
			});
			this.$('#MyTree').tree({
				dataSource : treeDataSource
			});

			this.$('#MyTree').on('selected', function(evt, data) {
				var path = data.info[0].additionalParameters.filePath;
				self.openFile(path);
			});

		},
		openFile : function(filePath) {

			file = new FileModel({
				path : filePath
			});
			file.fetch({
				async : false
			});
			fileName = file.get('fileName').split('.')[0];

			if ($('#editorRegion' + fileName).size() == 0) {
				$('#tabs').append('<li class><a href="#editorRegion' + fileName + '" data-toggle="tab">' + file.get('fileName') + ' <i class="icon-remove"></i></a></li>');
				$('#tab_content').append('<div class="tab-pane fade" id="editorRegion' + fileName + '"></div>');

				var editorView = new EditorView({
					vent : vent,
					user : user,
					configuration : configuration,
					model : file,
					socket : socket
				});
				editorView.render();
				$('#editorRegion' + fileName).append(editorView.el);
				$('#tabs a:last').tab('show');
			}
		}
	});
	return FueluxTreeView;
});
