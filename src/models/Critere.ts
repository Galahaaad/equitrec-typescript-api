export interface Critere {
    idcritere: number;
    libelle: string;
    idniveau: number;
    libelleniveau?: string;
    descriptionniveau?: string;
}

export interface CreateCritereRequest {
    libelle: string;
    idniveau: number;
}

export interface UpdateCritereRequest {
    libelle?: string;
    idniveau?: number;
}

export interface CreateCritereResponse {
    idcritere: number;
    libelle: string;
    idniveau: number;
}