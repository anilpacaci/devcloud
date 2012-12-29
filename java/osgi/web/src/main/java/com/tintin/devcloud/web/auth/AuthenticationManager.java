package com.tintin.devcloud.web.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * @author anil
 * 
 */
public class AuthenticationManager {

	private static final Logger logger = LoggerFactory
			.getLogger(AuthenticationManager.class);

	private Database database;
	private static AuthenticationManager instance;

	private AuthenticationManager() {
		database = Database.getInstance();
	}

	public static AuthenticationManager getInstance() {
		if (instance == null) {
			instance = new AuthenticationManager();
		}
		return instance;
	}

	public Session login(String username, String password, boolean staySignedIn)
			throws IllegalAccessException {
		User user = UserManager.getInstance().getUser(username);
		if (user == null) {
			logger.info("There is no such user: {}", username);
			return null;
		}
		if (!user.getPassword().equals(UserManager.md5(password))) {
			logger.info("Username/password do not match for user: {}", username);
			return null;
		}
		Session session = database.getSession(user.getId());
		if (session == null) {
			session = new Session(user.getId(), staySignedIn);
			database.insertSession(session);
			logger.info("Session created for user: {}", username);
		} else {
			logger.info("A valid session already exists for user: {}", username);
		}
		return session;
	}

	public boolean logoutUserFromSessionID(String sessionID)
			throws IllegalAccessException {
		if (sessionID == null || sessionID.isEmpty()) {
			return false;
		}
		database.removeSession(sessionID);
		logger.info("Session removed successfully");
		return true;
	}

	public User getUserFromSession(String sessionID) throws IllegalAccessException {
		if (sessionID == null || sessionID.isEmpty()) {
			return null;
		}
		return database.getUserFromSession(sessionID);
	}

}
