package com.devcloud.model;

import java.util.HashMap;

public class Theme {
	private String themeName;
	private HashMap<String, String> keywordColorPairs;
	private String backgroundColor;
	private String textFamily;
	private String textColor;
	
	public String getThemeName() {
		return themeName;
	}
	public void setThemeName(String themeName) {
		this.themeName = themeName;
	}
	public HashMap<String, String> getKeywordColorPairs() {
		return keywordColorPairs;
	}
	public void setKeywordColorPairs(HashMap<String, String> keywordColorPairs) {
		this.keywordColorPairs = keywordColorPairs;
	}
	public String getBackgroundColor() {
		return backgroundColor;
	}
	public void setBackgroundColor(String backgroundColor) {
		this.backgroundColor = backgroundColor;
	}
	public String getTextFamily() {
		return textFamily;
	}
	public void setTextFamily(String textFamily) {
		this.textFamily = textFamily;
	}
	public String getTextColor() {
		return textColor;
	}
	public void setTextColor(String textColor) {
		this.textColor = textColor;
	}
}
