define(['jquery', 'underscore', 'backbone', 'marionette', 'socketio', 'js/views/auth/login.view', 'js/views/auth/user.panel.view', 'js/layouts/main.layout', 'js/models/auth/login.model', 'js/models/auth/user.model', 'jquery_cookie', 'bootstrap'], function($, _, Backbone, Marionette, io, LoginView, UserPanelView, MainLayout, LoginModel, UserModel) {

	/**
	 * SOME GLOBAL FUNCTIONS THAT ARE OVERRIDED *
	 */

	//Override Marionette Template Loader to use RequireJS text loader
	Marionette.TemplateCache.prototype.loadTemplate = function(templateId) {
		// Marionette expects "templateId" to be the ID of a DOM element.
		// But with RequireJS, templateId is actually the full text of the template.
		var template = templateId;

		// Make sure we have a template before trying to compile it
		if (!template || template.length === 0) {
			var msg = "Could not find template: '" + templateId + "'";
			var err = new Error(msg);
			err.name = "NoTemplateError";
			throw err;
		}
		return template;
	}
	/////////////////////////////////////////////

	var EditorApp = new Marionette.Application();
	var vent = EditorApp.vent;
	var loginModel = new LoginModel();
	var user = new UserModel();
	var socket = null;

	EditorApp.addInitializer(function(options) {
		var SID = $.cookie('SID');

		if (!SID) {
			vent.trigger('auth:logout');
		}// there is cookie, verify SID from server, direct home or login
		else {
			user.fetch({
				//SID verified, user returned, directing home page
				success : function(response) {
					vent.trigger('auth:loggedIn', user);
				},
				//SID unverified, direct to login page
				error : function(response) {
					vent.trigger('auth:logout');
				}
			});
		}

	});

	vent.bindTo(vent, 'auth:loggedIn', function() {
		if(!socket || !socket.socket.connected) {
			socket = io.connect('http://localhost:8081/');

			socket.on('connect', function() {
				EditorApp.userPanelRegion.show(new UserPanelView({
					model : user,
					vent : vent
				}));
				EditorApp.mainRegion.show(new MainLayout({
					user : user,
					socket : socket,
					vent : vent
				}));
			});
		} else if(socket.socket.connected) {
			EditorApp.userPanelRegion.show(new UserPanelView({
				model : user,
				vent : vent
			}));
			EditorApp.mainRegion.show(new MainLayout({
				user : user,
				socket : socket,
				vent : vent
			}));
		}
		
		//EditorApp.consoleRegion.show(new ConsoleView());
	});

	vent.bindTo(vent, 'auth:logout', function() {
		if(socket)
			socket.emit('logout');


		vent.trigger('main:logout');

		EditorApp.userPanelRegion.close();
		EditorApp.mainRegion.show(new LoginView({
			model : loginModel,
			vent : vent,
			user : user
		}));
	});

	EditorApp.addRegions({
		menuRegion : "#menu",
		userPanelRegion : "#userPanel",
		mainRegion : "#main_section",
		//consoleRegion: '#console_section'
	});

	return EditorApp;
});
