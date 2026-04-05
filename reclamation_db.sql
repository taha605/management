
CREATE DATABASE IF NOT EXISTS reclamation_db;
USE reclamation_db;

CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    nom        VARCHAR(100) NOT NULL,
    prenom     VARCHAR(100) NOT NULL,
    email      VARCHAR(150) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    telephone  VARCHAR(20),
    adresse    TEXT,
    ville      VARCHAR(100),
    role       ENUM('client', 'technicien', 'admin', 'superadmin') DEFAULT 'client',
    is_active  BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories_appareils (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nom         VARCHAR(100) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reclamations (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    reference               VARCHAR(20) UNIQUE NOT NULL,
    client_id               INT NOT NULL,
    technicien_id           INT DEFAULT NULL,
    marque                  VARCHAR(100) NOT NULL,
    modele                  VARCHAR(100),
    categorie_id            INT,
    description_panne       TEXT NOT NULL,
    adresse_intervention    TEXT NOT NULL,
    ville_intervention      VARCHAR(100) NOT NULL,
    statut                  ENUM('en_attente','assignee','en_cours','resolue','fermee','annulee') DEFAULT 'en_attente',
    priorite                ENUM('normale','urgente') DEFAULT 'normale',
    notes_technicien        TEXT DEFAULT NULL,
    notes_admin             TEXT DEFAULT NULL,
    note_client             TINYINT DEFAULT NULL CHECK (note_client BETWEEN 1 AND 5),
    commentaire_client      TEXT DEFAULT NULL,
    date_reclamation        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_assignation        TIMESTAMP NULL DEFAULT NULL,
    date_debut_intervention TIMESTAMP NULL DEFAULT NULL,
    date_resolution         TIMESTAMP NULL DEFAULT NULL,
    date_fermeture          TIMESTAMP NULL DEFAULT NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id)     REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (technicien_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (categorie_id)  REFERENCES categories_appareils(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reclamations_historique (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    reclamation_id          INT NOT NULL,
    version                 INT NOT NULL,
    marque                  VARCHAR(100),
    modele                  VARCHAR(100),
    categorie_id            INT,
    description_panne       TEXT,
    adresse_intervention    TEXT,
    ville_intervention      VARCHAR(100),
    priorite                VARCHAR(20),
    modifie_par             INT NOT NULL,
    date_modification       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    raison                  TEXT,
    FOREIGN KEY (reclamation_id) REFERENCES reclamations(id) ON DELETE CASCADE,
    FOREIGN KEY (modifie_par)    REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS historique_statuts (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    reclamation_id INT NOT NULL,
    ancien_statut  VARCHAR(50),
    nouveau_statut VARCHAR(50) NOT NULL,
    changed_by     INT NOT NULL,
    commentaire    TEXT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reclamation_id) REFERENCES reclamations(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by)     REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT NOT NULL,
    reclamation_id INT DEFAULT NULL,
    titre          VARCHAR(200) NOT NULL,
    message        TEXT NOT NULL,
    is_read        BOOLEAN DEFAULT FALSE,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)        REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reclamation_id) REFERENCES reclamations(id) ON DELETE CASCADE
);

CREATE INDEX idx_reclamations_client   ON reclamations(client_id);
CREATE INDEX idx_reclamations_tech     ON reclamations(technicien_id);
CREATE INDEX idx_reclamations_statut   ON reclamations(statut);
CREATE INDEX idx_notifications_user    ON notifications(user_id, is_read);
CREATE INDEX idx_historique_rec        ON historique_statuts(reclamation_id);

CREATE VIEW v_reclamations_detail AS
SELECT
    r.*,
    CONCAT(c.prenom, ' ', c.nom)  AS client_nom,
    c.email                        AS client_email,
    c.telephone                    AS client_telephone,
    CONCAT(t.prenom, ' ', t.nom)  AS technicien_nom,
    t.email                        AS technicien_email,
    t.telephone                    AS technicien_telephone,
    ca.nom                         AS categorie_nom,
    TIMESTAMPDIFF(HOUR, r.date_reclamation, COALESCE(r.date_resolution, NOW())) AS duree_heures,
    TIMESTAMPDIFF(DAY,  r.date_reclamation, COALESCE(r.date_resolution, NOW())) AS duree_jours
FROM reclamations r
LEFT JOIN users c               ON r.client_id    = c.id
LEFT JOIN users t               ON r.technicien_id = t.id
LEFT JOIN categories_appareils ca ON r.categorie_id  = ca.id;


CREATE VIEW v_stats_admin AS
SELECT
    COUNT(*)                                        AS total,
    SUM(statut = 'en_attente')                      AS en_attente,
    SUM(statut = 'assignee')                        AS assignees,
    SUM(statut = 'en_cours')                        AS en_cours,
    SUM(statut = 'resolue')                         AS resolues,
    SUM(statut = 'fermee')                          AS fermees,
    SUM(statut = 'annulee')                         AS annulees,
    ROUND(AVG(note_client), 1)                      AS note_moyenne,
    ROUND(AVG(TIMESTAMPDIFF(HOUR, date_reclamation, date_resolution)), 1) AS duree_moyenne_heures
FROM reclamations;


DELIMITER $$

CREATE PROCEDURE sp_register_user(
    IN  p_nom       VARCHAR(100),
    IN  p_prenom    VARCHAR(100),
    IN  p_email     VARCHAR(150),
    IN  p_password  VARCHAR(255),
    IN  p_telephone VARCHAR(20),
    IN  p_adresse   TEXT,
    IN  p_ville     VARCHAR(100),
    IN  p_role      VARCHAR(20),
    OUT p_user_id   INT,
    OUT p_success   BOOLEAN,
    OUT p_message   VARCHAR(200)
)
sp_register_user: BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
        SET p_success = FALSE;
        SET p_message = 'Email déjà utilisé';
        SET p_user_id = NULL;
        LEAVE sp_register_user;
    END IF;

    IF p_role NOT IN ('client', 'technicien', 'admin', 'superadmin') THEN
        SET p_success = FALSE;
        SET p_message = 'Rôle invalide';
        SET p_user_id = NULL;
        LEAVE sp_register_user;
    END IF;

    INSERT INTO users (nom, prenom, email, password, telephone, adresse, ville, role)
    VALUES (p_nom, p_prenom, p_email, p_password, p_telephone, p_adresse, p_ville, p_role);

    SET p_user_id = LAST_INSERT_ID();

    IF p_role = 'client' THEN
        INSERT INTO notifications (user_id, titre, message)
        SELECT id,
            'Nouvel utilisateur',
            CONCAT(p_prenom, ' ', p_nom, ' vient de s''inscrire')
        FROM users WHERE role = 'admin';
    END IF;

    SET p_success = TRUE;
    SET p_message = 'Compte créé avec succès';
END sp_register_user$$

CREATE PROCEDURE sp_create_reclamation(
    IN  p_client_id       INT,
    IN  p_marque          VARCHAR(100),
    IN  p_modele          VARCHAR(100),
    IN  p_categorie_id    INT,
    IN  p_description     TEXT,
    IN  p_adresse         TEXT,
    IN  p_ville           VARCHAR(100),
    IN  p_priorite        VARCHAR(20),
    OUT p_reference       VARCHAR(20),
    OUT p_reclamation_id  INT,
    OUT p_success         BOOLEAN,
    OUT p_message         VARCHAR(200)
)
BEGIN
    SET p_reference = CONCAT('REC-', YEAR(NOW()), '-', FLOOR(10000 + RAND() * 90000));

    INSERT INTO reclamations (
        reference, client_id, marque, modele,
        categorie_id, description_panne,
        adresse_intervention, ville_intervention, priorite
    ) VALUES (
        p_reference, p_client_id, p_marque, p_modele,
        p_categorie_id, p_description,
        p_adresse, p_ville, COALESCE(p_priorite, 'normale')
    );

    SET p_reclamation_id = LAST_INSERT_ID();

    INSERT INTO notifications (user_id, reclamation_id, titre, message)
    SELECT id, p_reclamation_id,
        'Nouvelle réclamation',
        CONCAT('Réclamation ', p_reference, ' créée')
    FROM users WHERE role = 'admin';

    SET p_success = TRUE;
    SET p_message = 'Réclamation créée avec succès';
END$$


-- ------------------------------------------------------------
-- 3. sp_assign_technicien
-- ------------------------------------------------------------
CREATE PROCEDURE sp_assign_technicien(
    IN  p_reclamation_id INT,
    IN  p_technicien_id  INT,
    IN  p_admin_id       INT,
    OUT p_success        BOOLEAN,
    OUT p_message        VARCHAR(200)
)
sp_assign_technicien: BEGIN
    DECLARE v_ancien_statut VARCHAR(50);
    DECLARE v_reference     VARCHAR(20);
    DECLARE v_client_id     INT;

    SELECT statut, reference, client_id
    INTO v_ancien_statut, v_reference, v_client_id
    FROM reclamations WHERE id = p_reclamation_id;

    IF v_reference IS NULL THEN
        SET p_success = FALSE;
        SET p_message = 'Réclamation introuvable';
        LEAVE sp_assign_technicien;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM users
        WHERE id = p_technicien_id AND role = 'technicien' AND is_active = TRUE
    ) THEN
        SET p_success = FALSE;
        SET p_message = 'Technicien invalide ou inactif';
        LEAVE sp_assign_technicien;
    END IF;

    UPDATE reclamations SET
        technicien_id    = p_technicien_id,
        statut           = 'assignee',
        date_assignation = NOW()
    WHERE id = p_reclamation_id;

    INSERT INTO historique_statuts
        (reclamation_id, ancien_statut, nouveau_statut, changed_by, commentaire)
    VALUES
        (p_reclamation_id, v_ancien_statut, 'assignee', p_admin_id,
         CONCAT('Assignée au technicien ID ', p_technicien_id));

    INSERT INTO notifications (user_id, reclamation_id, titre, message)
    VALUES
        (p_technicien_id, p_reclamation_id, 'Nouvelle mission',
         CONCAT('Vous êtes assigné à la réclamation ', v_reference)),
        (v_client_id, p_reclamation_id, 'Réclamation assignée',
         CONCAT('Un technicien a été assigné à votre réclamation ', v_reference));

    SET p_success = TRUE;
    SET p_message = 'Technicien assigné avec succès';
END sp_assign_technicien$$


CREATE PROCEDURE sp_update_statut(
    IN  p_reclamation_id INT,
    IN  p_nouveau_statut VARCHAR(50),
    IN  p_user_id        INT,
    IN  p_commentaire    TEXT,
    OUT p_success        BOOLEAN,
    OUT p_message        VARCHAR(200)
)
sp_update_statut: BEGIN
    DECLARE v_ancien_statut VARCHAR(50);
    DECLARE v_reference     VARCHAR(20);
    DECLARE v_client_id     INT;
    DECLARE v_technicien_id INT;
    DECLARE v_user_role     VARCHAR(20);

    SELECT statut, reference, client_id, technicien_id
    INTO v_ancien_statut, v_reference, v_client_id, v_technicien_id
    FROM reclamations WHERE id = p_reclamation_id;

    IF v_reference IS NULL THEN
        SET p_success = FALSE;
        SET p_message = 'Réclamation introuvable';
        LEAVE sp_update_statut;
    END IF;

    SELECT role INTO v_user_role FROM users WHERE id = p_user_id;

    IF v_user_role = 'technicien' AND v_technicien_id != p_user_id THEN
        SET p_success = FALSE;
        SET p_message = 'Accès refusé';
        LEAVE sp_update_statut;
    END IF;

    IF p_nouveau_statut NOT IN ('en_attente','assignee','en_cours','resolue','fermee','annulee') THEN
        SET p_success = FALSE;
        SET p_message = 'Statut invalide';
        LEAVE sp_update_statut;
    END IF;

    UPDATE reclamations SET
        statut                  = p_nouveau_statut,
        date_debut_intervention = CASE WHEN p_nouveau_statut = 'en_cours' THEN NOW() ELSE date_debut_intervention END,
        date_resolution         = CASE WHEN p_nouveau_statut = 'resolue'  THEN NOW() ELSE date_resolution         END,
        date_fermeture          = CASE WHEN p_nouveau_statut = 'fermee'   THEN NOW() ELSE date_fermeture          END
    WHERE id = p_reclamation_id;

    INSERT INTO historique_statuts
        (reclamation_id, ancien_statut, nouveau_statut, changed_by, commentaire)
    VALUES
        (p_reclamation_id, v_ancien_statut, p_nouveau_statut, p_user_id, p_commentaire);

    INSERT INTO notifications (user_id, reclamation_id, titre, message)
    VALUES (
        v_client_id, p_reclamation_id,
        'Statut mis à jour',
        CONCAT('Réclamation ', v_reference, ': ', v_ancien_statut, ' → ', p_nouveau_statut)
    );

    SET p_success = TRUE;
    SET p_message = CONCAT('Statut changé: ', v_ancien_statut, ' → ', p_nouveau_statut);
END sp_update_statut$$

CREATE PROCEDURE sp_update_reclamation(
    IN  p_reclamation_id INT,
    IN  p_client_id      INT,
    IN  p_marque         VARCHAR(100),
    IN  p_modele         VARCHAR(100),
    IN  p_categorie_id   INT,
    IN  p_description    TEXT,
    IN  p_adresse        TEXT,
    IN  p_ville          VARCHAR(100),
    IN  p_raison         TEXT,
    OUT p_success        BOOLEAN,
    OUT p_message        VARCHAR(200)
)
sp_update_reclamation: BEGIN
    DECLARE v_version INT;
    DECLARE v_statut  VARCHAR(50);
    DECLARE v_owner   INT;

    SELECT client_id, statut
    INTO v_owner, v_statut
    FROM reclamations WHERE id = p_reclamation_id;

    IF v_owner IS NULL THEN
        SET p_success = FALSE;
        SET p_message = 'Réclamation introuvable';
        LEAVE sp_update_reclamation;
    END IF;

    IF v_owner != p_client_id THEN
        SET p_success = FALSE;
        SET p_message = 'Accès refusé';
        LEAVE sp_update_reclamation;
    END IF;

    IF v_statut != 'en_attente' THEN
        SET p_success = FALSE;
        SET p_message = 'Impossible de modifier — réclamation déjà traitée';
        LEAVE sp_update_reclamation;
    END IF;

    SELECT COALESCE(MAX(version), 0) + 1
    INTO v_version
    FROM reclamations_historique
    WHERE reclamation_id = p_reclamation_id;

    INSERT INTO reclamations_historique (
        reclamation_id, version,
        marque, modele, categorie_id,
        description_panne, adresse_intervention,
        ville_intervention, priorite,
        modifie_par, raison
    )
    SELECT
        id, v_version,
        marque, modele, categorie_id,
        description_panne, adresse_intervention,
        ville_intervention, priorite,
        p_client_id, p_raison
    FROM reclamations WHERE id = p_reclamation_id;

    UPDATE reclamations SET
        marque               = p_marque,
        modele               = p_modele,
        categorie_id         = p_categorie_id,
        description_panne    = p_description,
        adresse_intervention = p_adresse,
        ville_intervention   = p_ville,
        updated_at           = NOW()
    WHERE id = p_reclamation_id;

    SET p_success = TRUE;
    SET p_message = CONCAT('Modifiée — version ', v_version, ' archivée');
END sp_update_reclamation$$

DELIMITER ;

INSERT INTO categories_appareils (nom, description) VALUES
('Téléphone / Smartphone', 'iPhone, Samsung, Huawei...'),
('Ordinateur Portable',    'Laptop, MacBook...'),
('Ordinateur Fixe',        'PC Desktop, iMac...'),
('Tablette',               'iPad, Samsung Tab...'),
('Télévision',             'TV LCD, LED, OLED...'),
('Réfrigérateur',          'Frigo, Congélateur...'),
('Machine à laver',        'Lave-linge, Sèche-linge...'),
('Climatiseur',            'Split, Cassette...'),
('Autre',                  'Autre appareil électronique');

INSERT INTO users (nom, prenom, email, password, role) VALUES
('Admin', 'Système', 'admin@reclamation.ma',
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin');



DELIMITER $$

CREATE TRIGGER trg_reclamation_urgente
AFTER INSERT ON reclamations
FOR EACH ROW
BEGIN
    IF NEW.priorite = 'urgente' THEN
        INSERT INTO notifications (user_id, reclamation_id, titre, message)
        SELECT id, NEW.id,
            'Réclamation URGENTE',
            CONCAT('Réclamation urgente ', NEW.reference,
                   ' — ', NEW.marque,
                   ' — ', NEW.ville_intervention)
        FROM users WHERE role = 'admin' AND is_active = TRUE;
    END IF;
END$$


CREATE TRIGGER trg_technicien_charge
AFTER UPDATE ON reclamations
FOR EACH ROW
BEGIN
    DECLARE v_charge INT;


    IF NEW.technicien_id IS NOT NULL AND NEW.statut IN ('assignee', 'en_cours') THEN

        SELECT COUNT(*) INTO v_charge
        FROM reclamations
        WHERE technicien_id = NEW.technicien_id
          AND statut IN ('assignee', 'en_cours');

        
        IF v_charge >= 5 THEN
            INSERT INTO notifications (user_id, reclamation_id, titre, message)
            SELECT id, NEW.id,
                'Technicien surchargé',
                CONCAT('Le technicien ID ', NEW.technicien_id,
                       ' a ', v_charge, ' réclamations actives')
            FROM users WHERE role = 'admin' AND is_active = TRUE;
        END IF;

    END IF;
END$$


CREATE TRIGGER trg_retard_assignation
BEFORE UPDATE ON reclamations
FOR EACH ROW
BEGIN
    DECLARE v_heures INT;

    
    IF OLD.statut = 'en_attente' AND NEW.statut != 'en_attente' THEN

        SET v_heures = TIMESTAMPDIFF(HOUR, OLD.date_reclamation, NOW());
        IF v_heures > 48 THEN
            INSERT INTO notifications (user_id, reclamation_id, titre, message)
            SELECT id, OLD.id,
                'Réclamation en retard',
                CONCAT('Réclamation ', OLD.reference,
                       ' était en attente depuis ', v_heures, 'h')
            FROM users WHERE role = 'admin' AND is_active = TRUE;

            INSERT INTO historique_statuts
                (reclamation_id, ancien_statut, nouveau_statut, changed_by, commentaire)
            VALUES (
                OLD.id, OLD.statut, NEW.statut,
                NEW.technicien_id,
                CONCAT('Retard: réclamation était en attente ', v_heures, 'h')
            );
        END IF;

    END IF;
END$$

DELIMITER ;
