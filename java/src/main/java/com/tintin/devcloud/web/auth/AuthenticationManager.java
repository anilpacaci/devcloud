package com.tintin.devcloud.web.auth;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tintin.devcloud.database.manager.DatabaseManager;
import com.tintin.devcloud.database.model.Session;
import com.tintin.devcloud.database.model.User;
import com.tintin.devcloud.database.persistence.GenericPersistanceManager;

/**
 * 
 * @author anil
 * 
 */
public class AuthenticationManager {

	private static final Logger logger = LoggerFactory
			.getLogger(AuthenticationManager.class);

	private static AuthenticationManager instance;

	private AuthenticationManager() {
	}

	public static AuthenticationManager getInstance() {
		if (instance == null) {
			instance = new AuthenticationManager();
		}
		return instance;
	}

	public Session login(String username, String password, boolean staySignedIn)
			throws IllegalAccessException {
		Session session = null;
		String queryString = "SELECT u FROM User u WHERE u.email = :username and u.password = :password";
        EntityManager em = null;
        try {
            em = DatabaseManager.getEMF().createEntityManager();
            
            User user = (User)em.createQuery(queryString).setParameter("username", username).setParameter("password", password).setMaxResults(1).getSingleResult();

            if(user != null) {
            	session = new Session(user.getId(), staySignedIn);
            	user.setSession(session);
            	
            	GenericPersistanceManager.updateEntity(user, user.getId());
            }
            
        } catch (NoResultException e) {
            return null;

        } catch (RuntimeException e) {
            throw e;
        } finally {
            em.close();
        }
        
        return session;
//		User user = UserManager.getInstance().getUser(username);
//		if (user == null) {
//			logger.info("There is no such user: {}", username);
//			return null;
//		}
//		if (!user.getPassword().equals(UserManager.md5(password))) {
//			logger.info("Username/password do not match for user: {}", username);
//			return null;
//		}
//		Session session = database.getSession(user.getId());
//		if (session == null) {
//			session = new Session(user.getId(), staySignedIn);
//			database.insertSession(session);
//			logger.info("Session created for user: {}", username);
//		} else {
//			logger.info("A valid session already exists for user: {}", username);
//		}
	}

	public boolean logoutUserFromSessionID(String sessionID)
			throws IllegalAccessException {
		if (sessionID == null || sessionID.isEmpty()) {
			return false;
		}
//		database.removeSession(sessionID);
		logger.info("Session removed successfully");
		return true;
	}

	public User getUserFromSession(String sessionID) throws IllegalAccessException {
		User user = null;
		String queryString = "SELECT u FROM User u WHERE u.session.sessionID = :sessionID";
        EntityManager em = null;
        try {
            em = DatabaseManager.getEMF().createEntityManager();
            
            user = (User)em.createQuery(queryString).setParameter("sessionID", sessionID).getSingleResult();

        } catch (NoResultException e) {
            return null;

        } catch (RuntimeException e) {
            throw e;
        } finally {
            em.close();
        }
        
        return user;
	}

}
