package com.tintin.devcloud.database.service;

import com.tintin.devcloud.database.interfaces.IAuthenticationService;
import com.tintin.devcloud.database.model.Session;
import com.tintin.devcloud.database.model.User;

public class AuthenticationService implements IAuthenticationService {

	@Override
	public Session login(String username, String password) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean logout(String sessionId) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public User getUser(String sessionId) {
		// TODO Auto-generated method stub
		return null;
	}

}
