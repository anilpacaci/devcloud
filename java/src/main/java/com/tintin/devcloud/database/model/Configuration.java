package com.tintin.devcloud.database.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.xml.bind.annotation.XmlRootElement;

@Entity @XmlRootElement
public class Configuration {
	
	public static final String DEFAULT_THEME = "ace/theme/monokai";
	
	@Id @GeneratedValue
	private int id;
	private String themeName;
	
	public Configuration() {
	}
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getThemeName() {
		return themeName;
	}
	public void setThemeName(String themeName) {
		this.themeName = themeName;
	}
}
