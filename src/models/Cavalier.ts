export interface Cavalier {
    idcavalier: number;
    nomcavalier: string;
    prenomcavalier: string;
    datenaissance: Date;
    numerodossard: number;
    idclub: number;
    nomclub?: string;
}

export interface CreateCavalierRequest {
    nomcavalier: string;
    prenomcavalier: string;
    datenaissance: string;
    numerodossard: number;
    idclub: number;
}

export interface UpdateCavalierRequest {
    nomcavalier?: string;
    prenomcavalier?: string;
    datenaissance?: string;
    numerodossard?: number;
    idclub?: number;
}

export interface CreateCavalierResponse {
    idcavalier: number;
    nomcavalier: string;
    prenomcavalier: string;
    datenaissance: Date;
    numerodossard: number;
    idclub: number;
}
