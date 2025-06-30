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