export interface FicheNotation {
    idfichenotation: number;
    cumulenote: number;
    appreciation: string;
    isvalidate: boolean;
    idcavalier: number;
    nomcavalier?: string;
    prenomcavalier?: string;
    nomclub?: string;
}

export interface CreateFicheNotationRequest {
    cumulenote: number;
    appreciation: string;
    isvalidate?: boolean;
    idcavalier: number;
}

export interface UpdateFicheNotationRequest {
    cumulenote?: number;
    appreciation?: string;
    isvalidate?: boolean;
    idcavalier?: number;
}

export interface CreateFicheNotationResponse {
    idfichenotation: number;
    cumulenote: number;
    appreciation: string;
    isvalidate: boolean;
    idcavalier: number;
}
