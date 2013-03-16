package com.tintin.devcloud.database.interfaces;

import com.tintin.devcloud.database.model.Session;
import com.tintin.devcloud.database.model.User;

public interface IAuthenticationService {
	public Session login(String username, String password);
	public boolean logout(String sessionId);
	public User getUser(String sessionId);
}
