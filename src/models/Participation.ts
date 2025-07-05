export interface Participation {
    idcavalier: number;
    idcompetition: number;
    idniveau: number;
}

export interface ParticipationComplete {
    idcavalier: number;
    idcompetition: number;
    idniveau: number;
    nomcavalier: string;
    prenomcavalier: string;
    numerodossard: number;
    idclub: number;
    nomclub: string;
    nomcompetition: string;
    datecompetition: Date;
    libelleniveau: string;
    descriptionniveau?: string;
}

export interface CreateParticipationRequest {
    idcavalier: number;
    idcompetition: number;
    idniveau: number;
}

export interface UpdateParticipationRequest {
    idniveau: number;
}

export interface ParticipationsByCavalier {
    idcavalier: number;
    nomcavalier: string;
    prenomcavalier: string;
    numerodossard: number;
    participations: ParticipationDetail[];
}

export interface ParticipationDetail {
    idcompetition: number;
    nomcompetition: string;
    datecompetition: Date;
    idniveau: number;
    libelleniveau: string;
}

export interface ParticipationsByCompetition {
    idcompetition: number;
    nomcompetition: string;
    datecompetition: Date;
    participations: ParticipationCavalier[];
}

export interface ParticipationCavalier {
    idcavalier: number;
    nomcavalier: string;
    prenomcavalier: string;
    numerodossard: number;
    idclub: number;
    nomclub: string;
    idniveau: number;
    libelleniveau: string;
}