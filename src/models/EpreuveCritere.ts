export interface EpreuveCritere {
    idepreuve: number;
    idcritere: number;
}

export interface EpreuveWithCriteres {
    idepreuve: number;
    titre: string;
    description?: string;
    idjuge: number | null;
    nomjuge?: string;
    prenomjuge?: string;
    criteres: CritereInEpreuve[];
}

export interface CritereInEpreuve {
    idcritere: number;
    libelle: string;
}

export interface CritereWithEpreuves {
    idcritere: number;
    libelle: string;
    idniveau: number;
    libelleniveau?: string;
    descriptionniveau?: string;
    epreuves: EpreuveInCritere[];
}

export interface EpreuveInCritere {
    idepreuve: number;
    titre: string;
    description?: string;
    idjuge: number | null;
    nomjuge?: string;
    prenomjuge?: string;
}

export interface AssignCritereToEpreuveRequest {
    idcritere: number;
}

export interface AssignEpreuveToCritereRequest {
    idepreuve: number;
}