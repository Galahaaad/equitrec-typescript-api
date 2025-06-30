export interface FicheNotation {
    idfichenotation: number;
    cumulenote: number;
    appreciation: string;
    isvalidate: boolean;
    idcavalier: number;
    idepreuve: number;
    nomcavalier?: string;
    prenomcavalier?: string;
    nomclub?: string;
    titre?: string;
}

export interface CreateFicheNotationRequest {
    cumulenote: number;
    appreciation: string;
    isvalidate?: boolean;
    idcavalier: number;
    idepreuve: number;
}

export interface UpdateFicheNotationRequest {
    cumulenote?: number;
    appreciation?: string;
    isvalidate?: boolean;
    idcavalier?: number;
    idepreuve?: number;
}

export interface CreateFicheNotationResponse {
    idfichenotation: number;
    cumulenote: number;
    appreciation: string;
    isvalidate: boolean;
    idcavalier: number;
    idepreuve: number;
}
