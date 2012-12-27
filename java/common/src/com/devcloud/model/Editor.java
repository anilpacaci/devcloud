package com.devcloud.model;

import java.util.ArrayList;
import java.util.List;

public interface Editor {
	List<File> files = new ArrayList<File>();
	List<Theme> themes = new ArrayList<Theme>();
	Theme currentTheme = new Theme();
	
	public String getHightlightedContent(File file);
	public String getIndentedContent(File file);
	public String completeExpression(String expression, File file);
	public void setBreakpoint(File file, int lineNumber);
	public List<Integer> getBreakpoints();
	public int findExpression(String expression, File file);
	public boolean replaceExpression(String expression, File file);
	public void setTheme(String themeName);
}
