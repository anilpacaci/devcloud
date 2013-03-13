package com.tintin.devcloud.database;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.osgi.framework.Bundle;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

public class BundleUtils {
	private static BundleUtils instance = null;
	private Bundle bundle;
	private final DocumentBuilder builder;

	private BundleUtils() {
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		factory.setNamespaceAware(true);
		try {
			builder = factory.newDocumentBuilder();
		} catch (ParserConfigurationException ex) {
			throw new RuntimeException(
					"Unable to instantiate DocumentBuilder.", ex);
		}
	}

	public static synchronized BundleUtils getInstance() {
		if (instance == null)
			instance = new BundleUtils();
		return instance;
	}

	public Bundle getBundle() {
		return bundle;
	}

	public void setBundle(Bundle bundle) {
		this.bundle = bundle;
	}

	public Document loadResourceXML(final String resourceName) {
		URL url = loadResourceURL(resourceName);
		try {
			InputStream is = url.openStream();
			return builder.parse(is);
		} catch (SAXException e) {
			throw new RuntimeException("Unable to parse resource.", e);
		} catch (IOException e) {
			throw new RuntimeException("IO exception while parsing resource.",
					e);
		}
	}

	public URL loadResourceURL(final String resourceName) {
		URL url = null;
		if (bundle == null) {
			url = this.getClass().getResource(resourceName);
		} else {
			url = bundle.getResource(resourceName);
		}
		if (url == null) {
			throw new RuntimeException("Unable to access resource.");
		}
		return url;
	}
}