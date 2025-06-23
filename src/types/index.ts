// src/types/index.ts
import { Request } from 'express';

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export interface ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
}
