export interface Niveau {
    idniveau: number;
    libelle: string;
    description: string;
}

export interface CreateNiveauRequest {
    libelle: string;
    description: string;
}

export interface UpdateNiveauRequest {
    libelle?: string;
    description?: string;
}

export interface CreateNiveauResponse {
    idniveau: number;
    libelle: string;
    description: string;
}