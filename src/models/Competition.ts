export interface Competition {
    idcompetition: number;
    nomcompetition?: string;
    datecompetition: Date;
    idutilisateur: number;
    nomutilisateur?: string;
    prenomutilisateur?: string;
}

export interface CreateCompetitionRequest {
    nomcompetition: string;
    datecompetition: string; // ISO date string
    idutilisateur: number;
}

export interface UpdateCompetitionRequest {
    nomcompetition?: string;
    datecompetition?: string;
    idutilisateur?: number;
}

export interface CreateCompetitionResponse {
    idcompetition: number;
    nomcompetition: string;
    datecompetition: Date;
    idutilisateur: number;
}

export interface CompetitionWithJudges {
    idcompetition: number;
    nomcompetition?: string;
    datecompetition: Date;
    idutilisateur: number;
    nomutilisateur?: string;
    prenomutilisateur?: string;
    juges: JugeAssignment[];
}

export interface JugeAssignment {
    idjuge: number;
    nomjuge: string;
    prenomjuge: string;
    hasUserAccount: boolean;
    idutilisateur?: number;
}

export interface CompetitionWithEpreuves {
    idcompetition: number;
    nomcompetition?: string;
    datecompetition: Date;
    idutilisateur: number;
    nomutilisateur?: string;
    prenomutilisateur?: string;
    epreuves: EpreuveInCompetition[];
}

export interface EpreuveInCompetition {
    idepreuve: number;
    titre: string;
    description: string;
    idjuge: number;
    nomjuge?: string;
    prenomjuge?: string;
}

export interface CompetitionWithCavaliers {
    idcompetition: number;
    nomcompetition?: string;
    datecompetition: Date;
    idutilisateur: number;
    nomutilisateur?: string;
    prenomutilisateur?: string;
    cavaliers: CavalierInCompetition[];
}

export interface CavalierInCompetition {
    idcavalier: number;
    nomcavalier: string;
    prenomcavalier: string;
    numerodossard: number;
    idclub: number;
    nomclub: string;
    idniveau: number;
    libelleniveau: string;
}