/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * Copyright (c) 2010-2011 Oracle and/or its affiliates. All rights reserved.
 *
 * The contents of this file are subject to the terms of either the GNU
 * General Public License Version 2 only ("GPL") or the Common Development
 * and Distribution License("CDDL") (collectively, the "License").  You
 * may not use this file except in compliance with the License.  You can
 * obtain a copy of the License at
 * http://glassfish.java.net/public/CDDL+GPL_1_1.html
 * or packager/legal/LICENSE.txt.  See the License for the specific
 * language governing permissions and limitations under the License.
 *
 * When distributing the software, include this License Header Notice in each
 * file and include the License file at packager/legal/LICENSE.txt.
 *
 * GPL Classpath Exception:
 * Oracle designates this particular file as subject to the "Classpath"
 * exception as provided by Oracle in the GPL Version 2 section of the License
 * file that accompanied this code.
 *
 * Modifications:
 * If applicable, add the following below the License Header, with the fields
 * enclosed by brackets [] replaced by your own identifying information:
 * "Portions Copyright [year] [name of copyright owner]"
 *
 * Contributor(s):
 * If you wish your version of this file to be governed by only the CDDL or
 * only the GPL Version 2, indicate your decision by adding "[Contributor]
 * elects to include this software in this distribution under the [CDDL or GPL
 * Version 2] license."  If you don't indicate a single choice of license, a
 * recipient has the option to distribute your version of this file under
 * either the CDDL, the GPL Version 2 or to extend the choice of license to
 * its licensees as provided above.  However, if you add GPL Version 2 code
 * and therefore, elected the GPL Version 2 license, then the option applies
 * only if the new code is made subject to such option by the copyright
 * holder.
 */

package com.tintin.devcloud.database;

import java.util.Iterator;
import java.util.List;
import java.util.logging.Logger;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceRegistration;

import com.tintin.devcloud.database.interfaces.IAuthenticationService;
import com.tintin.devcloud.database.manager.DatabaseManager;
import com.tintin.devcloud.database.model.User;
import com.tintin.devcloud.database.service.AuthenticationService;

public class Activator implements BundleActivator {

	private Logger logger = Logger.getLogger(getClass().getName());

	private ServiceRegistration authenticationService;
	
	public synchronized void start(BundleContext context) throws Exception {
		logger.info("Activator start() START");
		// because we need to access to the current bundle elsewhere
		if (context != null) {
			BundleUtils.getInstance().setBundle(context.getBundle());
		}

		DatabaseManager.initialize();
		authenticationService = context.registerService(IAuthenticationService.class.getName(), new AuthenticationService(), null);

		logger.info("Activator start() END");
	}

	@Override
	public synchronized void stop(BundleContext context) throws Exception {
		logger.info("Activator stop()");
		authenticationService.unregister();
	}

	public void test() throws Exception {
        logger.info("Application test() START");
        Session session = null;
        try {
            Configuration cfg = new Configuration();
            cfg.configure(BundleUtils.getInstance().loadResourceURL("/hibernate.cfg.xml"));
            cfg.addDocument(BundleUtils.getInstance().loadResourceXML("/User.hbm.xml"));
            cfg.addDocument(BundleUtils.getInstance().loadResourceXML("/Session.hbm.xml"));
            SessionFactory sessionFactory = cfg.buildSessionFactory();
            session = sessionFactory.openSession();
            List<User> list = session.createCriteria(User.class).list();
            for (Iterator<User> iter = list.iterator(); iter.hasNext();) {
                User element = iter.next();
                logger.info(element.toString());
            }

            List<Session> list2 = session.createCriteria(Session.class).list();
            for (Iterator<Session> iter = list2.iterator(); iter.hasNext();) {
                Session element = iter.next();
                logger.info(element.toString());
            }
            session.close();
        } catch (Exception bhe) {
            logger.info("Exception caught: "+bhe.getMessage());
            throw bhe;
        } 
    }
}