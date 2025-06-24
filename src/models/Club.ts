export interface Club {
    idclub: number;
    nomclub: string;
}

export interface CreateClubRequest {
    nomclub: string;
}

export interface CreateClubResponse {
    idclub: number;
    nomclub: string;
}