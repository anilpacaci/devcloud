package com.tintin.devcloud.web.auth;

import java.nio.charset.Charset;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.apache.commons.codec.binary.Hex;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UserManager {

	private static final Logger logger = LoggerFactory
			.getLogger(UserManager.class);

	private Database database;

	private static UserManager userManager = null;

	private UserManager() {
		database = Database.getInstance();
	}

	public static UserManager getInstance() {
		if (userManager == null) {
			userManager = new UserManager();
		}
		return userManager;
	}

	public enum AccessLevel {
		ADMIN, READWRITE, READ;
	}

	public User createNewUser(String email, String password, String title,
			String name, String surname, AccessLevel accessLevel) throws IllegalAccessException {
		User user = new User(email, password, title, name, surname,
				accessLevel.ordinal());

		int userID = database.insertUser(user);
		user = database.getUser(userID);
		return user;
	}
	
	public User getUser(String email) throws IllegalAccessException {
		return database.getUser(email);
	}

	public static String md5(String str) {
		String result = null;
		try {
			MessageDigest messageDigest = MessageDigest.getInstance("MD5");
			messageDigest.reset();
			messageDigest.update(str.getBytes(Charset.forName("UTF8")));
			final byte[] resultByte = messageDigest.digest();
			result = new String(Hex.encodeHex(resultByte));
		} catch (NoSuchAlgorithmException e) {
			logger.error("FATAL::Should never throw such an exception", e);
		}
		return result;
	}

}
