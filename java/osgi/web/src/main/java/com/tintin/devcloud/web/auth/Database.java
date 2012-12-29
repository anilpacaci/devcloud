package com.tintin.devcloud.web.auth;

import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Date;

import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tintin.devcloud.web.auth.UserManager.AccessLevel;

public class Database {

	private static final String DATABASE_NAME = "devcloudUserDatabase";
	private static final String DB_USERNAME = "tintin";
	private static final String DB_PASSWORD = "tintin";

	private static final String dbURL = "jdbc:derby:" + DATABASE_NAME
			+ ";create=true;user=" + DB_USERNAME + ";password=" + DB_PASSWORD;

	private static final Logger logger = LoggerFactory
			.getLogger(Database.class);

	private static Database instance = null;

	public static Database getInstance() {
		if (instance == null) {
			try {
				instance = new Database();
				instance.initializeDatabase();
			} catch (IllegalAccessException e) {
				logger.error("Error at getting a Database instance.");
			}
		}
		return instance;
	}

	private Database() throws IllegalAccessException {
		try {
			Class.forName("org.apache.derby.jdbc.EmbeddedDriver");
			logger.info("Derby driver has been loaded");
		} catch (ClassNotFoundException e) {
			logger.error("Error at connecting to Derby Database for AuthenticationManager");
			throw new IllegalAccessException(e.getMessage());
		}
	}

	private Connection getConnection() throws SQLException {
		Connection connection = null;
		try {
			connection = DriverManager.getConnection(dbURL);
		} catch (SQLException e) {
			logger.error("Error at connectiong to Database: DriverManager.getConnection()");
			throw e;
		}
		return connection;
	}

	private void close(Connection connection) {
		try {
			connection.close();
		} catch (SQLException e) {
			logger.error("Problem while closing Database connection: connection.close()");
			try {
				connection.close();
			} catch (Exception e1) {
				// ignore
			}
		}
	}

	private void initializeDatabase() throws IllegalAccessException {
		// deleteDatabaseDirectory();
		logger.info("Initializing Derby Database...");
		if (databaseExists()) {
			logger.info("Derby Database already exists.");
			return;
		}
		createTables();
		logger.info("Tables are created successfully on Derby Database");
		createDefaultInstances();
		logger.info("Default records created successfully on Derby Database");
	}

	private boolean databaseExists() {
		File f = new File(DATABASE_NAME);
		if (f.exists()) {
			return true;
		}
		return false;
	}

	@SuppressWarnings("unused")
	private void deleteDatabaseDirectory() throws IllegalAccessException {
		File f = new File(DATABASE_NAME);
		if (f.exists()) {
			try {
				FileUtils.deleteDirectory(f);
			} catch (IOException e) {
				String msg = String.format(
						"Cannot delete the Database directory:%s",
						f.getAbsolutePath());
				logger.error(msg);
				throw new IllegalAccessException(msg);
			}
		}
	}

	private void createTables() throws IllegalAccessException {
		String createUserTable = "CREATE TABLE users ("
				+ "id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1), "
				+ "email VARCHAR(255) NOT NULL, "
				+ "password VARCHAR(32) NOT NULL, " + "title VARCHAR(63), "
				+ "name VARCHAR(255), " + "surname VARCHAR(255), "
				+ "access_level SMALLINT, " + "registration_time TIMESTAMP, "
				+ "UNIQUE(email), " + "PRIMARY KEY(id); ";

		String createSessionTable = "CREATE TABLE sessions ("
				+ "userid INTEGER NOT NULL, "
				+ "sessionid VARCHAR(63) NOT NULL, "
				+ "valid_until TIMESTAMP, " + "UNIQUE(sessionid), "
				+ "PRIMARY KEY(userid), "
				+ "FOREIGN KEY(userid) REFERENCES users(id))";

		Connection conn = null;
		try {
			conn = getConnection();
			Statement stmt = conn.createStatement();
			stmt.execute(createUserTable);
			stmt.execute(createSessionTable);
			stmt.close();
		} catch (Exception e) {
			String msg = "Error at creating users, organizations and sessions tables";
			logger.error(msg, e);
			throw new IllegalAccessException(msg);
		}
		close(conn);
	}

	private void createDefaultInstances() throws IllegalAccessException {
		UserManager um = UserManager.getInstance();

		User serbay = um.createNewUser("serbay", "metu", "Mr.", "Serbay",
				"Arslanhan", AccessLevel.ADMIN);
		User pacaci = um.createNewUser("anil", "metu", "Mr.", "Anil", "Pacaci",
				AccessLevel.ADMIN);
		User meric = um.createNewUser("meric", "metu", "Mr.", "Meric", "Taze",
				AccessLevel.ADMIN);
		User alican = um.createNewUser("alican", "metu", "Mr.", "Alican",
				"Guclukol", AccessLevel.ADMIN);
	}

	public int insertUser(User user) throws IllegalAccessException {
		Connection conn = null;
		int userID = -1;
		try {
			conn = getConnection();
			String insertString = "INSERT INTO users(email, password, title, name, surname, access_level, registration_time) VALUES(?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
			PreparedStatement pstmt = conn.prepareStatement(insertString,
					Statement.RETURN_GENERATED_KEYS);
			pstmt.setString(1, user.getEmail());
			pstmt.setString(2, UserManager.md5(user.getPassword()));
			pstmt.setString(3, user.getTitle());
			pstmt.setString(4, user.getName());
			pstmt.setString(5, user.getSurname());
			pstmt.setInt(6, user.getAccessLevel());
			pstmt.executeUpdate();
			ResultSet rs = pstmt.getGeneratedKeys();
			if (rs.next()) {
				userID = rs.getInt(1);
			}
			pstmt.close();
		} catch (SQLException e) {
			String msg = String.format("Error inserting user: %s",
					user.getEmail());
			logger.error(msg, e);
			throw new IllegalAccessException(msg);
		} finally {
			close(conn);
		}
		return userID;
	}

	public void insertSession(Session session) throws IllegalAccessException {
		Connection conn = null;
		try {
			conn = getConnection();
			String insertString = "INSERT INTO sessions(userid, sessionid, valid_until) VALUES(?, ?, ?)";
			PreparedStatement pstmt = conn.prepareStatement(insertString);
			pstmt.setInt(1, session.getUserID());
			pstmt.setString(2, session.getSessionID());
			Timestamp ts = null;
			if (session.getUntil() != null) {
				ts = new Timestamp(session.getUntil().getTime());
			}
			pstmt.setTimestamp(3, ts);
			pstmt.executeUpdate();
			pstmt.close();
		} catch (SQLException e) {
			String msg = String.format("Error inserting session for user: %d",
					session.getUserID());
			logger.error(msg, e);
			throw new IllegalAccessException(msg);
		} finally {
			close(conn);
		}
	}

	public void removeSession(String sessionID) throws IllegalAccessException {
		Connection conn = null;
		try {
			conn = getConnection();
			String deleteString = "DELETE FROM sessions WHERE sessionid = ?";
			PreparedStatement pstmt = conn.prepareStatement(deleteString);
			pstmt.setString(1, sessionID);
			pstmt.executeUpdate();
		} catch (SQLException e) {
			String msg = String.format("Error deleting session: %s", sessionID);
			logger.error(msg, e);
			throw new IllegalAccessException(msg);
		} finally {
			close(conn);
		}
	}

	public Session getSession(String sessionID) throws IllegalAccessException {
		return getSession(sessionID, -1);
	}

	public Session getSession(int userID) throws IllegalAccessException {
		return getSession(null, userID);
	}

	private Session getSession(String sessionID, int userID)
			throws IllegalAccessException {
		Session session = null;
		Connection conn = null;
		try {
			conn = getConnection();
			String selectString = null;
			if (sessionID != null) {
				selectString = "SELECT * FROM sessions WHERE sessionid = ?";
			} else {
				selectString = "SELECT * FROM sessions WHERE userid = ?";
			}
			PreparedStatement pstmt = conn.prepareStatement(selectString);
			if (sessionID != null) {
				pstmt.setString(1, sessionID);
			} else {
				pstmt.setInt(1, userID);
			}
			ResultSet rs = pstmt.executeQuery();
			if (rs.next()) {
				int uid = rs.getInt("userid");
				String sid = rs.getString("sessionid");
				Date validUntil = rs.getTimestamp("valid_until");
				session = new Session(uid, sid, validUntil);
			}
			rs.close();
			pstmt.close();
		} catch (SQLException e) {
			String msg = String.format("Error retrieving session: %s - %d",
					sessionID, userID);
			logger.error(msg, e);
			throw new IllegalAccessException(msg);
		} finally {
			close(conn);
		}
		return session;
	}

	public User getUserFromSession(String sessionID)
			throws IllegalAccessException {
		User user = null;
		Connection conn = null;
		try {
			conn = getConnection();
			String selectString = "SELECT * FROM sessions WHERE sessionid = ?";
			PreparedStatement pstmt = conn.prepareStatement(selectString);
			pstmt.setString(1, sessionID);
			ResultSet rs = pstmt.executeQuery();
			if (rs.next()) {
				int userID = rs.getInt("userid");
				Date validUntil = rs.getTimestamp("valid_until");
				if (validUntil == null
						|| validUntil.after(Calendar.getInstance().getTime())) {
					user = getUser(null, userID, conn);
				}
			}
			rs.close();
			pstmt.close();
		} catch (SQLException e) {
			String msg = String.format(
					"Error retrieving user from session: %s", sessionID);
			logger.error(msg, e);
			throw new IllegalAccessException(msg);
		} finally {
			close(conn);
		}
		return user;
	}

	public User getUser(String email) throws IllegalAccessException {
		return getUser(email, -1, null);
	}

	public User getUser(int userID) throws IllegalAccessException {
		return getUser(null, userID, null);
	}

	private User getUser(String email, int userID, Connection vconn)
			throws IllegalAccessException {
		User user = null;
		Connection conn = vconn;
		try {
			if (conn == null) {
				conn = getConnection();
			}
			String selectString = null;
			if (email != null) {
				selectString = "SELECT * FROM users WHERE email = ?";
			} else {
				selectString = "SELECT * FROM users WHERE id = ?";
			}
			PreparedStatement pstmt = conn.prepareStatement(selectString);
			if (email != null) {
				pstmt.setString(1, email);
			} else {
				pstmt.setInt(1, userID);
			}
			int organizationID = -1;
			ResultSet rs = pstmt.executeQuery();
			if (rs.next()) {
				int lid = rs.getInt("id");
				String lemail = rs.getString("email");
				String password = rs.getString("password");
				String title = rs.getString("title");
				String name = rs.getString("name");
				String surname = rs.getString("surname");
				short accessLevel = rs.getShort("access_level");
				Date registrationTime = rs.getTimestamp("registration_time");
				user = new User(lid, lemail, password, title, name, surname,
						accessLevel, registrationTime);
			}
			rs.close();
			pstmt.close();

		} catch (SQLException e) {
			String msg = String.format("Error retrieving user: %s - %d", email,
					userID);
			logger.error(msg, e);
			throw new IllegalAccessException(msg);
		} finally {
			close(conn);
		}
		return user;
	}

}
