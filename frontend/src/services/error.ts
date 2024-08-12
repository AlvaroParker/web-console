/**
 * ServiceError enum for all possible errors that can occur in the service layer
*/
export const enum ServiceError {
    Ok = "Ok", // 200
    NoContent = "No Content", // 204
    BadRequest = "Bad Request", // 400
    NotFound = "Not Found", // 404
    Unauthorized = "Unauthorized", // 401
    InternalServerError = "Internal Server Error", // 500
    Unknown = "Unknown", // 0
}

/**
 * Converts a number to a ServiceError
 */
export const fromNumber = (num: number): ServiceError => {
    switch (num) {
        case 200:
            return ServiceError.Ok;
        case 204:
            return ServiceError.NoContent;
        case 400:
            return ServiceError.BadRequest;
        case 401:
            return ServiceError.Unauthorized;
        case 404:
            return ServiceError.NotFound;
        case 500:
            return ServiceError.InternalServerError;
        default:
            return ServiceError.Unknown;
    }
}

// All services functions should return a Result type which enforces the user to handle the error case
/**
 * Result type for database operations
 * @param T - The type of the value in the result if successful
 * @param E - The type of the error in the result if NOT successful
 *
 * @example
 *```ts
 *const res = await getStudentByEmail("some@email.com");
 *if (res.kind === "ok") {
 *   console.log(res.value);
 *} else {
 *   console.error(res.error);
 *}
 *```
 */
export type Result<T, E> = { type: "Ok"; value: T } | { type: "Err"; error: E };
