
/**
 * 
 * @param {int} status for error statuc-code
 * @param {string} message for describing the error
 * @returns string Error instance
 */
export function createError (status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}