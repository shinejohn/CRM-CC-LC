export interface ApiResponse<T> {
    data: T;
    meta?: {
        total: number;
        page: number;
        per_page: number;
        last_page: number;
    };
    message?: string;
}

export interface ApiError {
    message: string;
    status: number;
    errors: Record<string, string[]>;
}

export interface PaginationParams {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_dir?: "asc" | "desc";
    search?: string;
}
