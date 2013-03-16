package com.tintin.devcloud.database.manager;

import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

import com.tintin.devcloud.database.BundleUtils;

public class DatabaseManager {

	private static SessionFactory hibernateSessionFactory = null;
	
	public static void initialize() {
		Configuration cfg = new Configuration();
        cfg.configure(BundleUtils.getInstance().loadResourceURL("/hibernate.cfg.xml"));
        cfg.addDocument(BundleUtils.getInstance().loadResourceXML("/User.hbm.xml"));
        cfg.addDocument(BundleUtils.getInstance().loadResourceXML("/Session.hbm.xml"));
        hibernateSessionFactory = cfg.buildSessionFactory();
	}
	
	public static SessionFactory getHibernateSessionFactory() {
		return hibernateSessionFactory;
	}

}
