export interface Epreuve {
    idepreuve: number;
    titre: string;
    description: string;
    idfichenotation?: number;
}

export interface CreateEpreuveRequest {
    titre: string;
    description: string;
    idfichenotation?: number;
}

export interface UpdateEpreuveRequest {
    titre?: string;
    description?: string;
    idfichenotation?: number;
}

export interface CreateEpreuveResponse {
    idepreuve: number;
    titre: string;
    description: string;
    idfichenotation?: number;
}