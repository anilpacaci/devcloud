package com.tintin.devcloud.web.util;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tintin.devcloud.database.model.User;
import com.tintin.devcloud.web.auth.AuthenticationManager;

/**
 * @author anil
 * 
 */
public class WebUtil {

	private static final Logger logger = LoggerFactory.getLogger(WebUtil.class);

	/**
	 * This function is used by some Resource classes to check the sessionID by
	 * retrieving the associated user.
	 * 
	 * @param sessionID
	 * @return
	 */
	public static User getUser(String sessionID) throws WebApplicationException {
		User user = null;
		try {
			user = AuthenticationManager.getInstance().getUserFromSession(
					sessionID);
		} catch (IllegalAccessException e) {
			logger.error("Cannot retrieve user from sessionID", e);
			throw new WebApplicationException(Status.INTERNAL_SERVER_ERROR);
		}
		if (user == null) {
			throw new WebApplicationException(Response
					.status(Status.UNAUTHORIZED).entity("Session Not valid.")
					.build());
		}
		return user;
	}

	/**
	 * This function is used by some Resource classes to check the validity of
	 * the user session ID.
	 * 
	 * @param sessionID
	 * @return
	 */
	public static void checkUserSession(String sessionID)
			throws WebApplicationException {
		getUser(sessionID);
	}

}
