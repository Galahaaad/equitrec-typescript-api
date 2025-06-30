export interface Caracteristique {
    idcaracteristique: number;
    libelle: string;
    description: string;
}

export interface CreateCaracteristiqueRequest {
    libelle: string;
    description: string;
}

export interface UpdateCaracteristiqueRequest {
    libelle?: string;
    description?: string;
}

export interface CreateCaracteristiqueResponse {
    idcaracteristique: number;
    libelle: string;
    description: string;
}