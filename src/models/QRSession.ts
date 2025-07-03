export interface QRSession {
    qr_session_id: string;
    id_juge: number;
    session_token: string;
    expires_at: Date;
    is_used: boolean;
    created_at: Date;
    used_at?: Date;
    created_by: number; // ID de l'admin qui a créé le QR
}

export interface CreateQRSessionRequest {
    id_juge: number;
    expires_in_hours?: number; // Par défaut 24h
}

export interface QRSessionResponse {
    qr_session_id: string;
    qr_data: string; // JSON stringifié pour le QR Code
    expires_at: Date;
    created_at: Date;
}

export interface ValidateQRRequest {
    qr_session_id: string;
}

export interface ValidateQRResponse {
    success: boolean;
    token: string;
    user: {
        idutilisateur: number;
        nomutilisateur: string;
        prenomutilisateur: string;
        username: string;
        idjuge: number;
        idrole: number;
    };
}

export interface QRCodeData {
    sessionId: string;
    judgeId: number;
    timestamp: number;
}