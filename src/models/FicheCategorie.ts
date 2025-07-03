// Interfaces pour la gestion des relations FicheNotation ↔ Catégorie
// Table de liaison: contenir (idfichenotation, idcategorie)

export interface FicheCategorie {
    idfichenotation: number;
    idcategorie: number;
}

export interface FicheNotationWithCategories {
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
    categories: CategorieInFiche[];
}

export interface CategorieInFiche {
    idcategorie: number;
    libelle: string;
    notefinal: number;
}

export interface CategorieWithFiches {
    idcategorie: number;
    libelle: string;
    notefinal: number;
    fiches: FicheInCategorie[];
}

export interface FicheInCategorie {
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

// Interfaces pour les opérations CRUD
export interface AssignCategorieToFicheRequest {
    idcategorie: number;
}

export interface AssignFicheToCategorieRequest {
    idfichenotation: number;
}