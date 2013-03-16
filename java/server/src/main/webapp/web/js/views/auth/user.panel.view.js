define(['jquery', 'backbone', 'marionette', 'text!templates/auth/user_panel.html'], function($, Backbone, Marionette, userPanel) {
	var UserPanelView = Marionette.ItemView.extend({
		template : userPanel,
		events : {
			'click button' : 'logout'
		},

		logout : function() {
			this.model.clear();
			$.ajax({
				type : 'DELETE',
				url : URL + 'auth'
			});
			$.cookie('SID', null);
			this.options.vent.trigger('auth:logout');
		}
	});
	return UserPanelView;
});
