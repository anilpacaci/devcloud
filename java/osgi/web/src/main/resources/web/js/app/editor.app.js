define(['jquery', 'underscore', 'backbone', 'marionette', 'js/views/auth/login.view', 'js/views/auth/user.panel.view', 'js/layouts/main.layout', 'js/models/auth/login.model', 'js/models/auth/user.model', 'jquery_cookie', 'bootstrap'], function($, _, Backbone, Marionette, LoginView, UserPanelView, MainLayout, LoginModel, UserModel) {

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
		//EditorApp.mainRegion.show(new EditorView());
		EditorApp.userPanelRegion.show(new UserPanelView({
			model : user,
			vent : vent
		}));
		EditorApp.mainRegion.show(new MainLayout({
			user : user
		}));
		//EditorApp.consoleRegion.show(new ConsoleView());
	});

	vent.bindTo(vent, 'auth:logout', function() {
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
