export interface Epreuve {
    idepreuve: number;
    titre: string;
    description: string;
    idjuge: number;
    nomjuge?: string;
    prenomjuge?: string;
}

export interface CreateEpreuveRequest {
    titre: string;
    description: string;
    idjuge: number;
}

export interface UpdateEpreuveRequest {
    titre?: string;
    description?: string;
    idjuge?: number;
}

export interface CreateEpreuveResponse {
    idepreuve: number;
    titre: string;
    description: string;
    idjuge: number;
}