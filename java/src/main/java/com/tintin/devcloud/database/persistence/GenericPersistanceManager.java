package com.tintin.devcloud.database.persistence;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tintin.devcloud.database.manager.DatabaseManager;

public class GenericPersistanceManager {

	private static final Logger logger = LoggerFactory
			.getLogger(GenericPersistanceManager.class);
	
	public static <T> T getEntityReference(Class<T> klass, Object id) {
        EntityManager em = null;
        EntityTransaction tx = null;
        T t = null;
        try {
            em = DatabaseManager.getEMF().createEntityManager();
            tx = em.getTransaction();
            tx.begin();
            t = em.getReference(klass, id);
            tx.commit();
            return t;

        } catch (RuntimeException e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            logger.error("Entity referansini alirken bir hata olustu. Id: {}, class: {}", id, klass.getName());
            throw e;

        } finally {
            em.close();
        }
    }

    public static <T> T findEntity(Class<T> klass, Object id) {
        EntityManager em = null;
        EntityTransaction tx = null;
        T t = null;
        try {
            em = DatabaseManager.getEMF().createEntityManager();
            tx = em.getTransaction();
            tx.begin();
            t = em.find(klass, id);
            tx.commit();
            return t;

        } catch (RuntimeException e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            logger.error("Entity'yi alirken bir hata olustu. Id: {}, class: {}", id, klass.getName());
            throw e;

        } finally {
            em.close();
        }
    }

    public static <T> T getEntity(Class<T> klass, Object id) {
        EntityManager em = null;
        EntityTransaction tx = null;
        T t = null;
        try {
            em = DatabaseManager.getEMF().createEntityManager();
            tx = em.getTransaction();
            tx.begin();
            t = em.find(klass, id);
            tx.commit();
            return t;

        } catch (RuntimeException e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            logger.error("Entity'yi cekerken bir hata olustu. id: {}, class: {}", id, klass.getName());
            throw e;
        } finally {
            closeEntityManager(em);
        }
    }

    /**
     * Save any kind of entity into the persistent storage
     * 
     * @param entity
     *            to be stored
     */
    public static <T> void saveEntity(T entity) {
        EntityManager em = null;
        EntityTransaction tx = null;
        try {
            em = DatabaseManager.getEMF().createEntityManager();
            tx = em.getTransaction();
            tx.begin();
            em.persist(entity);
            tx.commit();

        } catch (RuntimeException e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            logger.error("Entity'yi kaydederken bir hata olustu. class: {}", entity.getClass().getName());
            throw e;

        } finally {
            closeEntityManager(em);
        }
    }

    /**
     * Updates the existing record of the given entity in the database with the new values
     * 
     * @param entity
     *            to be updated
     */
    public synchronized static <T> T updateEntity(T entity, long id) {
        EntityManager em = null;
        EntityTransaction tx = null;
        try {
            em = DatabaseManager.getEMF().createEntityManager();
            tx = em.getTransaction();
            tx.begin();
            entity = em.merge(entity);
            tx.commit();
            return entity;
            
        } catch (RuntimeException e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            logger.error("Entity'yi udpate ederken bir hata olustu. Class: {}, id: {}", entity.getClass()
                    .getName(), id);
            throw e;

        } finally {
            em.close();
        }
    }

    /**
     * Removes the given entity from the database. Currently this method removes the given entity by loading
     * it into the entity manager. This requires an additional hit to the database. However, as removal is a
     * rare operation, the additional database hit is tolerable.
     * 
     * @param entity
     *            to be removed
     */
    public static <T> void removeEntity(T entity, long id) {
        EntityManager em = null;
        EntityTransaction tx = null;
        try {
            em = DatabaseManager.getEMF().createEntityManager();
            tx = em.getTransaction();
            @SuppressWarnings("unchecked")
            T loadedEntity = (T) em.find(entity.getClass(), id);
            em.remove(loadedEntity);
            tx.commit();

        } catch (RuntimeException e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            logger.error("Entity'yi silerken bir hata olustu. Id: {}, class: {}", id, entity.getClass()
                    .getName());
            throw e;

        } finally {
            em.close();
        }
    }
    
    public static void closeEntityManager(EntityManager em) {
        if (em != null) {
            try {
                em.close();
            } catch (Exception e) {
                logger.error("EntityManager kapatilamadi", e);
            }
        }
    }
}
