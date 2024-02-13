export interface ApiError {
    status: number,
    statusText: string,
    message: string,
    payload?: {
        Message: string
    }
}