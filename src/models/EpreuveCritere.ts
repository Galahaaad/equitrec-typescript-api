export interface EpreuveCritere {
    idepreuve: number;
    idcritere: number;
}

export interface EpreuveWithCriteres {
    idepreuve: number;
    nomepreuve: string;
    description?: string;
    idjuge: number;
    nomjuge?: string;
    prenomjuge?: string;
    criteres: CritereInEpreuve[];
}

export interface CritereInEpreuve {
    idcritere: number;
    libelle: string;
    description?: string;
}

export interface CritereWithEpreuves {
    idcritere: number;
    libelle: string;
    description?: string;
    epreuves: EpreuveInCritere[];
}

export interface EpreuveInCritere {
    idepreuve: number;
    nomepreuve: string;
    description?: string;
    idjuge: number;
    nomjuge?: string;
    prenomjuge?: string;
}

export interface AssignCritereToEpreuveRequest {
    idcritere: number;
}

export interface AssignEpreuveToCritereRequest {
    idepreuve: number;
}