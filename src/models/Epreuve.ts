export interface Epreuve {
    idepreuve: number;
    titre: string;
    description: string;
    idjuge: number;
    nomjuge?: string;
    prenomjuge?: string;
}

export interface CreateEpreuveRequest {
    titre: string;
    description: string;
    idjuge: number;
}

export interface UpdateEpreuveRequest {
    titre?: string;
    description?: string;
    idjuge?: number;
}

export interface CreateEpreuveResponse {
    idepreuve: number;
    titre: string;
    description: string;
    idjuge: number;
}

export interface EpreuveWithCompetitions {
    idepreuve: number;
    titre: string;
    description: string;
    idjuge: number;
    nomjuge?: string;
    prenomjuge?: string;
    competitions: CompetitionInEpreuve[];
}

export interface CompetitionInEpreuve {
    idcompetition: number;
    nomcompetition?: string;
    datecompetition: Date;
    idutilisateur: number;
    nomutilisateur?: string;
    prenomutilisateur?: string;
}