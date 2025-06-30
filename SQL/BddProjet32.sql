-- Create Table Projet 32

Drop Table If Exists Posseder;
Drop Table If Exists Caracteristique;
Drop Table If Exists Avoir;
Drop Table If Exists Materiel;
Drop Table If Exists Detenir;
Drop Table If Exists Composer;
Drop Table If Exists Contenir;
Drop Table If Exists Categorie;
Drop Table If Exists FicheNotation;
Drop Table If Exists Epreuve;
Drop Table If Exists Participer;
Drop Table If Exists Cavalier;
Drop Table If Exists Club;
Drop Table If Exists Critere;
Drop Table If Exists Niveau;
Drop Table If Exists Juger;
Drop Table If Exists Competition;
Drop Table If Exists Utilisateur;
Drop Table If Exists Juge;
Drop Table If Exists Role;


Create Table Role(
                     idRole serial,
                     libelle varchar(100),
                     Constraint Role_PK Primary Key (idRole)
);

Create Table Juge(
                     idJuge serial,
                     nomJuge varchar(50),
                     prenomJuge varchar(50),
                     codePin char(4),
                     Constraint Juge_Pk Primary Key (idJuge)
);

Create Table Utilisateur(
                            idUtilisateur serial,
                            nomUtilisateur varchar(50),
                            prenomUtilisateur varchar(50),
                            username varchar(100),
                            password varchar(255),
                            idJuge int,
                            idRole int,
                            Constraint Utilisateur_PK Primary Key (idUtilisateur),
                            Constraint Utilisateur_Juge_FK Foreign Key (idJuge) References Juge(idJuge),
                            Constraint Utilisateur_Role_FK Foreign Key (idRole) References Role(idRole)
);

Create Table Competition(
                            idCompetition serial,
                            dateCompetition timestamp,
                            idUtilisateur int,
                            Constraint Competition_PK Primary Key (idCompetition),
                            Constraint Competition_Utilisateur_FK Foreign Key (idUtilisateur) References Utilisateur(idUtilisateur)
);

Create Table Juger(
                      idJuge int,
                      idCompetition int,
                      Constraint Juger_PK Primary Key (idJuge, idCompetition),
                      Constraint Juger_Juge_FK Foreign Key (idJuge) References Juge(idJuge),
                      Constraint Juger_Competition_FK Foreign Key (idCompetition) References Competition(idCompetition)
);

Create Table Niveau(
                       idNiveau serial,
                       libelle varchar(200),
                       description varchar(500),
                       Constraint Niveau_PK Primary Key (idNiveau)
);

Create Table Critere(
                        idCritere serial,
                        libelle varchar(500),
                        idNiveau int,
                        Constraint Critere_PK Primary Key (idCritere),
                        Constraint Critere_Niveau_FK Foreign Key (idNiveau) References Niveau(idNiveau)
);

Create Table Club(
                     idClub serial,
                     nomClub varchar(100),
                     Constraint Club_PK Primary Key (idClub)
);

Create Table Cavalier(
                         idCavalier serial,
                         nomCavalier varchar(100),
                         prenomCavalier varchar(100),
                         dateNaissance timestamp,
                         numeroDossard int,
                         idClub int,
                         Constraint Cavalier_PK Primary Key (idCavalier),
                         Constraint Cavalier_Club_FK Foreign Key (idClub) References Club(idClub)
);

Create Table Participer(
                           idCavalier int,
                           idNiveau int,
                           idCompetition int,
                           Constraint Participer_PK Primary Key (idCavalier, idNiveau, idCompetition),
                           Constraint Participer_Cavalier_FK Foreign Key(idCavalier) References Cavalier(idCavalier),
                           Constraint Participer_Niveau_FK Foreign Key(idNiveau) References Niveau(idNiveau),
                           Constraint Participer_Competition_Fk Foreign Key(idCompetition) References Competition(idCompetition)
);

Create Table Epreuve(
                        idEpreuve serial,
                        titre varchar(100),
                        description varchar(500),
                        idJuge int,
                        Constraint Epreuve_PK Primary Key (idEpreuve),
                        Constraint Epreuve_Juge_FK Foreign Key (idJuge) References Juge(idJuge)
);

Create Table FicheNotation(
                              idFicheNotation serial,
                              cumuleNote int,
                              appreciation varchar(500),
                              isValidate boolean,
                              idCavalier int,
                              idEpreuve int,
                              Constraint FicheNotation_PK Primary Key (idFicheNotation),
                              Constraint FicheNotation_Cavalier_FK Foreign Key (idCavalier) References Cavalier(idCavalier),
                              Constraint FicheNotation_Epreuve_FK Foreign Key (idEpreuve) References Epreuve(idEpreuve)
);

Create Table Categorie(
                          idCategorie serial,
                          libelle varchar(200),
                          noteFinal int,
                          Constraint Categorie_PK Primary Key (idCategorie)
);

Create Table Contenir(
                         idFicheNotation int,
                         idCategorie int,
                         Constraint Contenir_PK Primary Key (idFicheNotation, idCategorie),
                         Constraint Contenir_FicheNotation_FK Foreign Key (idFicheNotation) References FicheNotation(idFicheNotation),
                         Constraint Contenir_Categorie_FK Foreign Key (idCategorie) References Categorie(idCategorie)
);

Create Table Composer(
                         idCompetition int,
                         idEpreuve int,
                         Constraint Composer_PK Primary Key (idCompetition, idEpreuve),
                         Constraint Composer_Competition_FK Foreign Key (idCompetition) References Competition(idCompetition),
                         Constraint Composer_Epreuve_FK Foreign Key (idEpreuve) References Epreuve(idEpreuve)
);

Create Table Detenir(
                        idCritere int,
                        idEpreuve int,
                        Constraint Detenir_PK Primary Key (idCritere, idEpreuve),
                        Constraint Detenir_Critere_FK Foreign Key (idCritere) References Critere(idCritere),
                        Constraint Detenir_Epreuve_FK Foreign Key (idEpreuve) References Epreuve(idEpreuve)
);

Create Table Materiel(
                         idMateriel serial,
                         libelle varchar(200),
                         Constraint Materiel_PK Primary Key (idMateriel)
);

Create Table Avoir(
                      idEpreuve int,
                      idMateriel int,
                      quantite int,
                      Constraint Avoir_PK Primary Key (idEpreuve, idMateriel),
                      Constraint Avoir_Epreuve_FK Foreign Key (idEpreuve) References Epreuve (idEpreuve),
                      Constraint Avoir_Materiel_FK Foreign Key (idMateriel) References Materiel (idMateriel)
);

Create Table Caracteristique(
                                idCaracteristique serial,
                                libelle varchar(200),
                                description varchar(500),
                                Constraint Caracteristique_PK Primary Key (idCaracteristique)
);

Create Table Posseder(
                         idEpreuve int,
                         idCaracteristique int,
                         Constraint Posseder_PK Primary Key (idEpreuve, idCaracteristique),
                         Constraint Posseder_Epreuve_FK Foreign Key (idEpreuve) References Epreuve(idEpreuve),
                         Constraint Posseder_Caracteristique_FK Foreign Key (idCaracteristique) References Caracteristique(idCaracteristique)
);