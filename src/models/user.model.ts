export interface User {
    id: string;
    nom: string;
    prenom: string;
    username: string;
    password: string;
    roles: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface UserDTO {
    id: string;
    nom: string;
    prenom: string;
    username: string;
    roles: string[];
    createdAt: Date;
    updatedAt: Date;
}