export interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "user" | "manager";
    avatar?: string;
    created_at: string;
    updated_at: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    refresh_token: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData extends LoginCredentials {
    name: string;
    confirm_password?: string;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    status: number;
}

export interface ThemeConfig {
    themeName: string;
    primaryColor: string;
    borderRadius: number;
    darkMode: boolean;
}
