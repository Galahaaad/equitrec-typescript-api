export interface Juge {
    idjuge: number;
    nomjuge: string;
    prenomjuge: string;
    codepin?: string | null;
}

export interface CreateJugeRequest {
    nomjuge: string;
    prenomjuge: string;
}

export interface UpdateJugeRequest {
    nomjuge?: string;
    prenomjuge?: string;
}

export interface CreateJugeResponse {
    idjuge: number;
    nomjuge: string;
    prenomjuge: string;
}

export interface JugeWithCompetitions {
    idjuge: number;
    nomjuge: string;
    prenomjuge: string;
    competitions: CompetitionAssignment[];
    hasUserAccount: boolean;
    idutilisateur?: number;
}

export interface CompetitionAssignment {
    idcompetition: number;
    datecompetition: Date;
    nomutilisateur?: string;
    prenomutilisateur?: string;
}

export interface AssignJugeToCompetitionRequest {
    idjuge: number;
    idcompetition: number;
}

export interface JugeForQR {
    idjuge: number;
    nomjuge: string;
    prenomjuge: string;
    idutilisateur?: number;
    canGenerateQR: boolean;
}