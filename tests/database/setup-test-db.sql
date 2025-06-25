-- Script de création de la base de données de test
-- À exécuter avant de lancer les tests

-- Créer la base de données de test si elle n'existe pas
CREATE DATABASE equitrec_test;

-- Se connecter à la base de test
\c equitrec_test;

-- Créer les tables (copie du script principal)
DROP TABLE IF EXISTS Posseder;
DROP TABLE IF EXISTS Caracteristique;
DROP TABLE IF EXISTS Avoir;
DROP TABLE IF EXISTS Materiel;
DROP TABLE IF EXISTS Detenir;
DROP TABLE IF EXISTS Epreuve;
DROP TABLE IF EXISTS Contenir;
DROP TABLE IF EXISTS Categorie;
DROP TABLE IF EXISTS FicheNotation;
DROP TABLE IF EXISTS Participer;
DROP TABLE IF EXISTS Cavalier;
DROP TABLE IF EXISTS Club;
DROP TABLE IF EXISTS Niveau;
DROP TABLE IF EXISTS Critere;
DROP TABLE IF EXISTS Juger;
DROP TABLE IF EXISTS Competition;
DROP TABLE IF EXISTS Utilisateur;
DROP TABLE IF EXISTS Juge;
DROP TABLE IF EXISTS Role;

CREATE TABLE Role(
    idRole serial,
    libelle varchar(100),
    CONSTRAINT Role_PK PRIMARY KEY (idRole)
);

CREATE TABLE Juge(
    idJuge serial,
    nomJuge varchar(50),
    prenomJuge varchar(50),
    CONSTRAINT Juge_Pk PRIMARY KEY (idJuge)
);

CREATE TABLE Utilisateur(
    idUtilisateur serial,
    nomUtilisateur varchar(50),
    prenomUtilisateur varchar(50),
    username varchar(100),
    password varchar(50),
    idJuge int,
    idRole int,
    CONSTRAINT Utilisateur_PK PRIMARY KEY (idUtilisateur),
    CONSTRAINT Utilisateur_Juge_FK FOREIGN KEY (idJuge) REFERENCES Juge(idJuge),
    CONSTRAINT Utilisateur_Role_FK FOREIGN KEY (idRole) REFERENCES Role(idRole)
);

CREATE TABLE Competition(
    idCompetition serial,
    dateCompetition timestamp,
    idUtilisateur int,
    CONSTRAINT Competition_PK PRIMARY KEY (idCompetition),
    CONSTRAINT Competition_Utilisateur_FK FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur(idUtilisateur)
);

CREATE TABLE Juger(
    idJuge int,
    idCompetition int,
    CONSTRAINT Juger_PK PRIMARY KEY (idJuge, idCompetition),
    CONSTRAINT Juger_Juge_FK FOREIGN KEY (idJuge) REFERENCES Juge(idJuge),
    CONSTRAINT Juger_Competition_FK FOREIGN KEY (idCompetition) REFERENCES Competition(idCompetition)
);

CREATE TABLE Niveau(
    idNiveau serial,
    libelle varchar(200),
    description varchar(500),
    CONSTRAINT Niveau_PK PRIMARY KEY (idNiveau)
);

CREATE TABLE Critere(
    idCritere serial,
    libelle varchar(500),
    idNiveau int,
    CONSTRAINT Critere_PK PRIMARY KEY (idCritere),
    CONSTRAINT Critere_Niveau_FK FOREIGN KEY (idNiveau) REFERENCES Niveau(idNiveau)
);

CREATE TABLE Club(
    idClub serial,
    nomClub varchar(100),
    CONSTRAINT Club_PK PRIMARY KEY (idClub)
);

CREATE TABLE Cavalier(
    idCavalier serial,
    nomCavalier varchar(100),
    prenomCavalier varchar(100),
    dateNaissance timestamp,
    numeroDossard int,
    idClub int,
    CONSTRAINT Cavalier_PK PRIMARY KEY (idCavalier),
    CONSTRAINT Cavalier_Club_FK FOREIGN KEY (idClub) REFERENCES Club(idClub)
);

CREATE TABLE Participer(
    idCavalier int,
    idNiveau int,
    idCompetition int,
    CONSTRAINT Participer_PK PRIMARY KEY (idCavalier, idNiveau, idCompetition),
    CONSTRAINT Participer_Cavalier_FK FOREIGN KEY(idCavalier) REFERENCES Cavalier(idCavalier),
    CONSTRAINT Participer_Niveau_FK FOREIGN KEY(idNiveau) REFERENCES Niveau(idNiveau),
    CONSTRAINT Participer_Competition_Fk FOREIGN KEY(idCompetition) REFERENCES Competition(idCompetition)
);

CREATE TABLE FicheNotation(
    idFicheNotation serial,
    cumuleNote int,
    appreciation varchar(500),
    isValidate boolean,
    idCavalier int,
    CONSTRAINT FicheNotation_PK PRIMARY KEY (idFicheNotation),
    CONSTRAINT FicheNotation_Cavalier_FK FOREIGN KEY (idCavalier) REFERENCES Cavalier(idCavalier)
);

CREATE TABLE Categorie(
    idCategorie serial,
    libelle varchar(200),
    noteFinal int,
    CONSTRAINT Categorie_PK PRIMARY KEY (idCategorie)
);

CREATE TABLE Contenir(
    idFicheNotation int,
    idCategorie int,
    idNote int,
    CONSTRAINT Contenir_PK PRIMARY KEY (idFicheNotation, idCategorie),
    CONSTRAINT Contenir_FicheNotation_FK FOREIGN KEY (idFicheNotation) REFERENCES FicheNotation(idFicheNotation),
    CONSTRAINT Contenir_Categorie_FK FOREIGN KEY (idCategorie) REFERENCES Categorie(idCategorie)
);

CREATE TABLE Epreuve(
    idEpreuve serial,
    titre varchar(100),
    description varchar(500),
    idFicheNotation int,
    CONSTRAINT Epreuve_PK PRIMARY KEY (idEpreuve),
    CONSTRAINT Epreuve_FicheNotation_FK FOREIGN KEY (idFicheNotation) REFERENCES FicheNotation(idFicheNotation)
);

CREATE TABLE Detenir(
    idCritere int,
    idEpreuve int,
    CONSTRAINT Detenir_PK PRIMARY KEY (idCritere, idEpreuve),
    CONSTRAINT Detenir_Critere_FK FOREIGN KEY (idCritere) REFERENCES Critere(idCritere),
    CONSTRAINT Detenir_Epreuve_FK FOREIGN KEY (idEpreuve) REFERENCES Epreuve(idEpreuve)
);

CREATE TABLE Materiel(
    idMateriel serial,
    libelle varchar(200),
    CONSTRAINT Materiel_PK PRIMARY KEY (idMateriel)
);

CREATE TABLE Avoir(
    idEpreuve int,
    idMateriel int,
    CONSTRAINT Avoir_PK PRIMARY KEY (idEpreuve, idMateriel),
    CONSTRAINT Avoir_Epreuve_FK FOREIGN KEY (idEpreuve) REFERENCES Epreuve (idEpreuve),
    CONSTRAINT Avoir_Materiel_FK FOREIGN KEY (idMateriel) REFERENCES Materiel (idMateriel)
);

CREATE TABLE Caracteristique(
    idCaracteristique serial,
    libelle varchar(200),
    description varchar(500),
    CONSTRAINT Caracteristique_PK PRIMARY KEY (idCaracteristique)
);

CREATE TABLE Posseder(
    idEpreuve int,
    idCaracteristique int,
    CONSTRAINT Posseder_PK PRIMARY KEY (idEpreuve, idCaracteristique),
    CONSTRAINT Posseder_Epreuve_FK FOREIGN KEY (idEpreuve) REFERENCES Epreuve(idEpreuve),
    CONSTRAINT Posseder_Caracteristique_FK FOREIGN KEY (idCaracteristique) REFERENCES Caracteristique(idCaracteristique)
);