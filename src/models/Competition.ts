export interface Competition {
    idcompetition: number;
    datecompetition: Date;
    idutilisateur: number;
    nomutilisateur?: string;
    prenomutilisateur?: string;
}

export interface CreateCompetitionRequest {
    datecompetition: string; // ISO date string
    idutilisateur: number;
}

export interface UpdateCompetitionRequest {
    datecompetition?: string;
    idutilisateur?: number;
}

export interface CreateCompetitionResponse {
    idcompetition: number;
    datecompetition: Date;
    idutilisateur: number;
}

export interface CompetitionWithJudges {
    idcompetition: number;
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