package com.tintin.devcloud.database.model;

import java.io.Serializable;
import java.util.Calendar;
import java.util.Date;
import java.util.UUID;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Transient;
import javax.xml.bind.annotation.XmlRootElement;

@Entity @XmlRootElement
public class Session implements Serializable {
	@Id
	private String sessionID;
	private Date until;
	@Transient
	private int userID;

	public Session() {
	}
	
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
	
	public String getSessionID() {
		return sessionID;
	}
	public void setSessionID(String sessionID) {
		this.sessionID = sessionID;
	}
	public Date getUntil() {
		return until;
	}
	public void setUntil(Date until) {
		this.until = until;
	}
	public int getUserID() {
		return userID;
	}
	public void setUserID(int userID) {
		this.userID = userID;
	}
}
