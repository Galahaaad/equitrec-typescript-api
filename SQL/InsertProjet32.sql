-- Insert bdd
ALTER SEQUENCE role_idrole_seq RESTART WITH 1;

Insert into Role (libelle) VALUES
                               ('Super Administrateur'),
                               ('Gérant'),
                               ('Juge')
;

INSERT INTO Juge (idJuge, nomJuge, prenomJuge, codePin) VALUES
                                                            (1, 'Yazbek', 'Rachel', NULL),
                                                            (2, 'Nidam', 'Mamoune', NULL),
                                                            (3, 'Dupont', 'Jean', NULL),
                                                            (4, 'Durand', 'Lucie', NULL),
                                                            (5, 'Martin', 'Paul', NULL),
                                                            (6, 'Moreau', 'Sophie', NULL),
                                                            (7, 'Goudet', 'Magali', NULL),
                                                            (8, 'Berns', 'Benjamin', NULL),
                                                            (9, 'Kebriti', 'Eddy', NULL),
                                                            (10, 'Machin', 'Truc', NULL)
;

INSERT INTO Utilisateur (idUtilisateur, nomUtilisateur, prenomUtilisateur, email, username, password, idJuge, idRole) VALUES
                                                                                                                          (1, 'Yazbek', 'Rachel', 'racyaz@gmail.com', 'ryazbek', 'pass123', 1, 3),
                                                                                                                          (2, 'Nidam', 'Mamoune', 'mamnid@gmail.com', 'mamounette', '123456789', 2, 3),
                                                                                                                          (3, 'Dupont', 'Jean', 'jeadup@gmail.com', 'jdupont', 'secret', 3, 1),
                                                                                                                          (4, 'Durand', 'Lucie', 'lucdur@gmail.com', 'ldurand', 'luciePwd', 4, 3),
                                                                                                                          (5, 'Martin', 'Paul', 'paumar@gmail.com', 'pmartin', 'pm1234', 5, 3),
                                                                                                                          (6, 'Moreau', 'Sophie', 'sopmor@gmail.com', 'smoreau', 'sm456', 6, 3),
                                                                                                                          (7, 'Goudet', 'Magali', 'maggou@gmail.com', 'mgoudet', 'test123', 7, 2),
                                                                                                                          (8, 'Berns', 'Benjamin', 'benber@gmail.com', 'bberns', '12345689787', 8, 2),
                                                                                                                          (9, 'Kebriti', 'Eddy', 'eddkeb@gmail.com', 'ekebriti', 'abcd123', 9, 2),
                                                                                                                          (10, 'Machin', 'Truc', 'trumac@gmail.com', 'tmachin', 'ahahahahahahahaha', 10, 2)
;


INSERT INTO Competition (nomCompetition, dateCompetition, idUtilisateur) VALUES
                                                                             ('Coupe de France' ,'2025-06-01 10:00:00', 7),
                                                                             ('Coupe de la Lozère' ,'2025-08-02 14:30:00', 8),
                                                                             ('Coupe de Larzac' ,'2025-06-05 09:00:00', 9),
                                                                             ('Coupe de TrecInvitational' ,'2025-06-10 16:00:00', 10)
;

INSERT INTO Juger (idJuge, idCompetition) VALUES
                                              (1, 1),
                                              (2, 1),
                                              (3, 1),
                                              (1, 2),
                                              (3, 2),
                                              (4, 2),
                                              (2, 3),
                                              (4, 3),
                                              (1, 3),
                                              (2, 4),
                                              (4, 4),
                                              (3, 4),
                                              (1, 4)
;

INSERT INTO Niveau (libelle, description) VALUES
                                              ('Club 1', 'Moyen niveau'),
                                              ('Club Poney 2', 'Moyen niveau'),
                                              ('Club Elite', 'Haut niveau'),
                                              ('Amateur 3', 'Bas niveau'),
                                              ('Amateur 2', 'Bas niveau'),
                                              ('Amateur 1', 'Bas niveau'),
                                              ('Amateur Elite', 'Moyen niveau')
;

Insert Into Critere (libelle, idNiveau) VALUES
                                            ('Largeur : 0,70 m', 1),
                                            ('Largeur : 0,70 m', 2),
                                            ('Largeur : 0,60 m', 3),
                                            ('Largeur : 0,60 m', 4),
                                            ('Largeur : de 0,50 m a 0,60 m', 5),
                                            ('Largeur : de 0,50 m a 0,60 m', 6),
                                            ('Largeur : de 0,50 m', 7)
;

INSERT INTO Club (nomClub) VALUES
                               ('Les Cavaliers du Vent'),
                               ('Écurie de la Forêt Noire'),
                               ('TREC Nature Aventure'),
                               ('Les Randonneurs du Causse'),
                               ('Écuries du Petit Galop'),
                               ('Centre Équestre du Val d’Or'),
                               ('Caval TREC 42'),
                               ('Les Sabots de l’Ouest'),
                               ('Association Équilibre & Nature'),
                               ('Les Cavaliers du Vercors')
;

INSERT INTO Cavalier (nomCavalier, prenomCavalier, dateNaissance, numeroDossard, idClub) VALUES
                                                                                             ('Durand', 'Alice', '1998-05-14', 101, 1),
                                                                                             ('Martin', 'Julien', '2001-03-22', 102, 1),
                                                                                             ('Schmitt', 'Claire', '1995-11-09', 103, 2),
                                                                                             ('Lemoine', 'Axel', '2000-07-30', 104, 2),
                                                                                             ('Moreau', 'Camille', '1997-01-05', 105, 3),
                                                                                             ('Dubois', 'Lucas', '1999-09-17', 106, 3),
                                                                                             ('Girard', 'Elodie', '2002-04-19', 107, 4),
                                                                                             ('Picard', 'Noah', '1996-12-01', 108, 4),
                                                                                             ('Mercier', 'Léa', '2003-06-25', 109, 5),
                                                                                             ('Blanc', 'Nathan', '2000-08-12', 110, 5),
                                                                                             ('Robert', 'Emma', '1998-02-28', 111, 6),
                                                                                             ('Faure', 'Tom', '1997-10-15', 112, 6),
                                                                                             ('Henry', 'Manon', '2001-12-04', 113, 7),
                                                                                             ('Garnier', 'Louis', '1995-03-09', 114, 7),
                                                                                             ('Perrin', 'Julie', '2002-09-21', 115, 8),
                                                                                             ('Lambert', 'Antoine', '1999-01-26', 116, 8),
                                                                                             ('Roux', 'Sarah', '2000-05-03', 117, 9),
                                                                                             ('Barbier', 'Enzo', '1998-07-11', 118, 9),
                                                                                             ('Colin', 'Inès', '2001-11-06', 119, 10),
                                                                                             ('Jacquet', 'Théo', '1996-06-18', 120, 10)
;


INSERT INTO Participer (idCavalier, idNiveau, idCompetition) VALUES
                                                                 (1, 1, 1),
                                                                 (2, 2, 1),
                                                                 (3, 3, 1),
                                                                 (4, 1, 1),
                                                                 (5, 2, 1),
                                                                 (6, 3, 2),
                                                                 (7, 1, 2),
                                                                 (8, 2, 2),
                                                                 (9, 3, 2),
                                                                 (10, 1, 3),
                                                                 (11, 2, 3),
                                                                 (12, 3, 3),
                                                                 (13, 1, 3),
                                                                 (14, 2, 3),
                                                                 (15, 3, 3),
                                                                 (16, 1, 4),
                                                                 (17, 2, 4),
                                                                 (18, 3, 4),
                                                                 (19, 1, 4),
                                                                 (20, 2, 4)
;

INSERT INTO Epreuve(titre, description, idJuge) VALUES
    ('Bordure Maraîchère en Selle', 'Epreuve pour démo', 1)
;
--Une seule épreuve pour l'instant est suffiant, c'est d'ailleur ce qui est demendé pour la démo


INSERT INTO FicheNotation (cumuleNote, appreciation, isValidate, idCavalier, idEpreuve) VALUES
                                                                                            (10, 'Très bon cavalier, bonne technique.', true, 1, 1),
                                                                                            (9, 'Bon comportement mais peut améliorer la précision.', true, 2, 1),
                                                                                            (11, 'Excellente performance globale.', true, 3, 1),
                                                                                            (7, 'Doit travailler l`équilibre.', true, 4, 1),
                                                                                            (8, 'Progression constante, encourageant.', true, 5, 1),
                                                                                            (10, 'Très bon, particulièrement en saut.', true, 10, 1),
                                                                                            (6, 'Encore beaucoup à apprendre.', true, 11, 1),
                                                                                            (9, 'Bonne endurance et attitude.', true, 12, 1),
                                                                                            (11, 'Très prometteur.', true, 13, 1),
                                                                                            (7, 'Besoin d`améliorer la posture.', true, 14, 1),
                                                                                            (12, 'Performance exceptionnelle.', true, 15, 1),
                                                                                            (8, 'Travail à continuer.', true, 16, 1),
                                                                                            (9, 'Très régulier, très fiable.', true, 17, 1),
                                                                                            (6, 'Trop nerveux, manque de concentration.', true, 18, 1),
                                                                                            (8, 'Potentiel intéressant.', true, 19, 1),
                                                                                            (7, 'Technique à affiner.', true, 20, 1),
                                                                                            (NULL, NULL, false, 6, 1),
                                                                                            (NULL, NULL, false, 7, 1),
                                                                                            (NULL, NULL, false, 8, 1),
                                                                                            (NULL, NULL, false, 9, 1)
;

-- Cavalier 6, 7, 8 et 9 appartiennent à la même compétion (id2), elle n'a pas commencé en gros

INSERT INTO Categorie (libelle, noteFinal) VALUES
                                               -- Fiche 1
                                               ('Contrat', 4),
                                               ('Allures', 3),
                                               ('Pénalités', 3),
                                               -- Fiche 2
                                               ('Contrat', 3),
                                               ('Allures', 3),
                                               ('Pénalités', 3),
                                               -- Fiche 3
                                               ('Contrat', 4),
                                               ('Allures', 4),
                                               ('Pénalités', 3),
                                               -- Fiche 4
                                               ('Contrat', 3),
                                               ('Allures', 2),
                                               ('Pénalités', 2),
                                               -- Fiche 5
                                               ('Contrat', 3),
                                               ('Allures', 3),
                                               ('Pénalités', 2),
                                               -- Fiche 6
                                               ('Contrat', 4),
                                               ('Allures', 3),
                                               ('Pénalités', 3),
                                               -- Fiche 7
                                               ('Contrat', 2),
                                               ('Allures', 2),
                                               ('Pénalités', 2),
                                               -- Fiche 8
                                               ('Contrat', 3),
                                               ('Allures', 3),
                                               ('Pénalités', 3),
                                               -- Fiche 9
                                               ('Contrat', 4),
                                               ('Allures', 4),
                                               ('Pénalités', 3),
                                               -- Fiche 10
                                               ('Contrat', 2),
                                               ('Allures', 3),
                                               ('Pénalités', 2),
                                               -- Fiche 11
                                               ('Contrat', 4),
                                               ('Allures', 4),
                                               ('Pénalités', 4),
                                               -- Fiche 12
                                               ('Contrat', 3),
                                               ('Allures', 3),
                                               ('Pénalités', 2),
                                               -- Fiche 13
                                               ('Contrat', 3),
                                               ('Allures', 3),
                                               ('Pénalités', 3),
                                               -- Fiche 14
                                               ('Contrat', 2),
                                               ('Allures', 2),
                                               ('Pénalités', 2),
                                               -- Fiche 15
                                               ('Contrat', 3),
                                               ('Allures', 3),
                                               ('Pénalités', 2),
                                               -- Fiche 16
                                               ('Contrat', 2),
                                               ('Allures', 2),
                                               ('Pénalités', 3),
                                               -- Fiche 17
                                               ('Contrat', 0),
                                               ('Allures', 0),
                                               ('Pénalités', 0),
                                               -- Fiche 18
                                               ('Contrat', 0),
                                               ('Allures', 0),
                                               ('Pénalités', 0),
                                               -- Fiche 19
                                               ('Contrat', 0),
                                               ('Allures', 0),
                                               ('Pénalités', 0),
                                               -- Fiche 20
                                               ('Contrat', 0),
                                               ('Allures', 0),
                                               ('Pénalités', 0)
;

INSERT INTO Contenir (idFicheNotation, idCategorie) VALUES
                                                        (1, 1),
                                                        (1, 2),
                                                        (1, 3),
                                                        (2, 4),
                                                        (2, 5),
                                                        (2, 6),
                                                        (3, 7),
                                                        (3, 8),
                                                        (3, 9),
                                                        (4, 10),
                                                        (4, 11),
                                                        (4, 12),
                                                        (5, 13),
                                                        (5, 14),
                                                        (5, 15),
                                                        (6, 16),
                                                        (6, 17),
                                                        (6, 18),
                                                        (7, 19),
                                                        (7, 20),
                                                        (7, 21),
                                                        (8, 22),
                                                        (8, 23),
                                                        (8, 24),
                                                        (9, 25),
                                                        (9, 26),
                                                        (9, 27),
                                                        (10, 28),
                                                        (10, 29),
                                                        (10, 30),
                                                        (11, 31),
                                                        (11, 32),
                                                        (11, 33),
                                                        (12, 34),
                                                        (12, 35),
                                                        (12, 36),
                                                        (13, 37),
                                                        (13, 38),
                                                        (13, 39),
                                                        (14, 40),
                                                        (14, 41),
                                                        (14, 42),
                                                        (15, 43),
                                                        (15, 44),
                                                        (15, 45),
                                                        (16, 46),
                                                        (16, 47),
                                                        (16, 48),
                                                        (17, 49),
                                                        (17, 50),
                                                        (17, 51),
                                                        (18, 52),
                                                        (18, 53),
                                                        (18, 54),
                                                        (19, 55),
                                                        (19, 56),
                                                        (19, 57),
                                                        (20, 58),
                                                        (20, 59),
                                                        (20, 60)
;

--Du coup on va considérer que chaque compétition n'est composée que d'une seule épreuve :

INSERT INTO Composer (idCompetition, idEpreuve) VALUES
                                                    (1, 1),
                                                    (2, 1),
                                                    (3, 1),
                                                    (4, 1)
;

INSERT INTO Detenir (idCritere, idEpreuve) VALUES
                                               (1, 1),
                                               (2, 1),
                                               (3, 1),
                                               (4, 1),
                                               (5, 1),
                                               (6, 1),
                                               (7, 1)
;

INSERT INTO Materiel (libelle) VALUES
                                   ('Fanions rouges'),
                                   ('Fanions blancs'),
                                   ('Numéro'),
                                   ('Barres ou demi-rondes de 4 mètres')
;

INSERT INTO Avoir (idEpreuve, idMateriel, quantite) VALUES
                                                        (1, 1, 2),
                                                        (1, 2, 2),
                                                        (1, 3, 1),
                                                        (1, 4, 4)
;

INSERT INTO Caracteristique (libelle, description) VALUES
                                                       ('Dispositif', 'Le dispositif est matérialisé par des barres posées et fixées au sol.'),
                                                       ('Largeur', 'Largeur intérieure du couloir de 0,5 à 0,7 mètre.'),
                                                       ('Dévers', 'Eviter les dévers.'),
                                                       ('Terrain', 'Terrain régulier.'),
                                                       ('Longueur', 'Longueur 8 mètres.')
;

INSERT INTO Posseder (idEpreuve, idCaracteristique) VALUES
                                                        (1, 1),
                                                        (1, 2),
                                                        (1, 3),
                                                        (1, 4),
                                                        (1, 5)
;