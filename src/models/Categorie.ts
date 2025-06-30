export interface Categorie {
    idcategorie: number;
    libelle: string;
    notefinal: number;
}

export interface CreateCategorieRequest {
    libelle: string;
    notefinal: number;
}

export interface UpdateCategorieRequest {
    libelle?: string;
    notefinal?: number;
}

export interface CreateCategorieResponse {
    idcategorie: number;
    libelle: string;
    notefinal: number;
}