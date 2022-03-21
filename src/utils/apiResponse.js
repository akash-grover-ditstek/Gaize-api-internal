import HttpStatus from './StatusCodes.js';
import {
    ErrorMessage
} from './ErrorUtil.js'
export default class ApiResponse {

    static success = (res, data) => {
        return res.status(HttpStatus.OK).json({
            data,
            success: true
        });
    };

    static error = (res, status = HttpStatus.BAD_REQUEST, error = ErrorMessage.BAD_REQUEST) => {
        let errors = {}
        let message
        if (error.details) {
            // error.errors.forEach(error => {
            //     errors[error.path] = error.message
            // })
            error.details.forEach(error => {
                errors[error.path] = error.message
            })
        } else {
            message = error.message ? error.message : undefined
        }
        let jsonResponse = {
            errors: errors,
            success: false,
            message
        }
        return res.status(status).json(jsonResponse);
    };
}