define(['jquery', 'backbone', 'marionette', 'text!templates/auth/login_form.html', 'jquery_cookie'], function($, Backbone, Marionette, loginForm) {
	var LoginView = Marionette.ItemView.extend({
		template : loginForm,
		className : 'hero-unit',
		events : {
			'click button' : 'signIn'
		},

		signIn : function() {
			if (!this.$('#username').val() || !this.$('#password').val() ) {
				alert('Please enter username and password');
			} else {
				this.model.set({
					'username' : this.$('#username').val(),
					'password' : this.$('#password').val(),
					'rememberMe' : this.$('#rememberMe').is(':checked')
				});
				this.options.vent.trigger('auth:loggedIn');
			}
		}
	});
	return LoginView;
});
