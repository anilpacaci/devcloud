package com.tintin.devcloud.web.auth;

import java.io.IOException;
import java.nio.charset.Charset;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;

import org.apache.commons.codec.binary.Hex;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tintin.devcloud.database.model.Configuration;
import com.tintin.devcloud.database.model.User;
import com.tintin.devcloud.database.persistence.GenericPersistanceManager;

public class UserManager {

	private static final Logger logger = LoggerFactory
			.getLogger(UserManager.class);


	private static UserManager userManager = null;

	private UserManager() {
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
			String name, String surname, AccessLevel accessLevel) throws IllegalAccessException, IOException {
		User user = new User(email, password, title, name, surname, accessLevel.ordinal(), new Date());
		Configuration configuration = new Configuration();
		configuration.setThemeName(Configuration.DEFAULT_THEME);
		user.setConfiguration(configuration);
		GenericPersistanceManager.saveEntity(user);
		
		try {
			Runtime.getRuntime().exec("sudo useradd -m " + email).waitFor();
			Runtime.getRuntime().exec("sudo su -c '(echo " + password + " & echo " + password + ") | sudo passwd " + email + "'").waitFor();
			Runtime.getRuntime().exec("rm -rf /home/" + email + "/examples.desktop").waitFor();
			Runtime.getRuntime().exec(new String[] {"chmod", "-R", "700", "/home/"+email}).waitFor();
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
//		User user = new User(email, password, title, name, surname,
//				accessLevel.ordinal());
//
//		int userID = database.insertUser(user);
//		user = database.getUser(userID);
//		return user;
		return user;
	}
	
	public User getUser(String email) throws IllegalAccessException {
//		return database.getUser(email);
		return new User();
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
