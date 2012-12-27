package com.devcloud.interfaces;


import java.util.HashMap;

import com.devcloud.exception.UserOperationException;
import com.devcloud.model.Session;
import com.devcloud.model.User;


public interface UserManager  extends AbstractManager {
	public HashMap<Session, User> loggedInUsers = new HashMap<Session, User>();

	public Session login(String username, String password) throws UserOperationException;
	
	public User register(User user) throws UserOperationException;
	
	public User update(Session session, User user) throws UserOperationException;
}
