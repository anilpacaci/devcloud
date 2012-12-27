package com.devcloud.model;
import java.io.File;


public class Project {
	private File root;
	private String type;
	
	public File getRoot() {
		return root;
	}
	public void setRoot(File root) {
		this.root = root;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
}
