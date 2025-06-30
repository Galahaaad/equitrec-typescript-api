CREATE OR REPLACE FUNCTION createJugeAfterNewUser()
RETURNS TRIGGER AS $$
DECLARE
newJugeId INT;
BEGIN

INSERT INTO Juge(nomJuge, prenomJuge, codePin)
VALUES (NEW.nomUtilisateur, NEW.prenomUtilisateur, NULL)
    RETURNING idJuge INTO newJugeId;

UPDATE Utilisateur
SET idJuge = newJugeId
WHERE idUtilisateur = NEW.idUtilisateur;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS triggerNewJugeFromNewUser ON Utilisateur;

CREATE TRIGGER triggerNewJugeFromNewUser
    AFTER INSERT ON Utilisateur
    FOR EACH ROW
    EXECUTE FUNCTION createJugeAfterNewUser();