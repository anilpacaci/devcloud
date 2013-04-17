define(['jquery', 'underscore', 'backbone', 'marionette', 'socketio', 'js/views/auth/login.view', 'js/views/auth/register.view', 'js/views/auth/user.panel.view', 'js/layouts/main.layout', 'js/models/auth/login.model', 'js/models/auth/register.model', 'js/models/auth/user.model', 'js/models/auth/configuration.model','jquery_cookie', 'jquery_ui', 'bootstrap'], function($, _, Backbone, Marionette, io, LoginView, RegisterView, UserPanelView, MainLayout, LoginModel, RegisterModel, UserModel, ConfigurationModel) {

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
	var registerModel = new RegisterModel();
	var user = new UserModel();
	var configuration = new ConfigurationModel();
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

			configuration.fetch({
				//SID verified, user returned, directing home page
				success : function(response) {
				},
				//SID unverified, direct to login page
				error : function(response) {
				}
			})
		}

	});

	vent.bindTo(vent, 'auth:loggedIn', function() {
		if (!socket || !socket.socket.connected) {
			socket = io.connect('http://localhost:8081/?sessionID='+$.cookie('SID'));

			socket.on('connect', function() {
				EditorApp.userPanelRegion.show(new UserPanelView({
					model : user,
					vent : vent
				}));
				EditorApp.mainRegion.show(new MainLayout({
					user : user,
					configuration : configuration,
					socket : socket,
					vent : vent
				}));

				socket.emit('debugger:create', {
					executable : '/home/serbay/Codes/graduation_project/apache-tomcat-7.0.37/serbay.arslanhan@gmail.com/a.out'
				});

				socket.on('debugger:create_response', function(data) {
					alert('debugger created id: ' + data.id);
				});

				/*
				* other available commands for the debugger
				* debugger:run 						-------- parameters : id
				* debugger:set_breakpoint			-------- parameters : file, line, id
				* debugger:remove_breakpoint		-------- parameters : file, line, id
				* debugger:next						-------- parameters : id
				* debugger:continue					-------- parameters : id
				*/
			});

			socket.on('error', function() {
				EditorApp.userPanelRegion.show(new UserPanelView({
					model : user,
					vent : vent
				}));
				EditorApp.mainRegion.show(new MainLayout({
					user : user,
					configuration : configuration,
					socket : socket,
					vent : vent
				}));
			})
		} else {
			EditorApp.userPanelRegion.show(new UserPanelView({
				model : user,
				vent : vent
			}));
			EditorApp.mainRegion.show(new MainLayout({
				user : user,
				configuration : configuration,
				socket : socket,
				vent : vent
			}));
		}

		//EditorApp.consoleRegion.show(new ConsoleView());
	});

	vent.bindTo(vent, 'auth:logout', function() {
		if (socket)
			socket.emit('logout');

		vent.trigger('main:logout');

		EditorApp.userPanelRegion.close();
		EditorApp.mainRegion.show(new LoginView({
			model : loginModel,
			vent : vent,
			user : user
		}));
	});

	vent.bindTo(vent, 'auth:register', function() {
		EditorApp.mainRegion.show(new RegisterView({
			model : registerModel,
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
