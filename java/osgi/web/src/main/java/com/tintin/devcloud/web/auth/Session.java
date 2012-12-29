package com.tintin.devcloud.web.auth;

import java.util.Calendar;
import java.util.Date;
import java.util.UUID;

/**
 * Session information is only used for the REST-API of the MDR
 * 
 * @author anil
 * 
 */
public class Session {

	private int userID;
	private String sessionID;
	private Date until;

	public Session(int userID, boolean staySignedIn) {
		this.userID = userID;
		this.sessionID = UUID.randomUUID().toString();
		if (staySignedIn) {
			Calendar now = Calendar.getInstance();
			now.add(Calendar.YEAR, 10);
			this.until = now.getTime();
		} else {
			this.until = null;
		}
	}

	public Session(int userID, String sessionID, Date until) {
		super();
		this.userID = userID;
		this.sessionID = sessionID;
		this.until = until;
	}

	public int getUserID() {
		return userID;
	}

	public String getSessionID() {
		return sessionID;
	}

	public Date getUntil() {
		return until;
	}

}
