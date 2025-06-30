export interface Materiel {
    idmateriel: number;
    libelle: string;
}

export interface CreateMaterielRequest {
    libelle: string;
}

export interface UpdateMaterielRequest {
    libelle?: string;
}

export interface CreateMaterielResponse {
    idmateriel: number;
    libelle: string;
}

export interface MaterielWithQuantite {
    idmateriel: number;
    libelle: string;
    quantite: number;
}