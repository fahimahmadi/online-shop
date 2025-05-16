import { error } from "console"
import { createError } from "../utils/errors.js"

/* Handle undefined routes  */
export const handle_404 = function(){
    return (req, res, next) => {
        next(createError(404, "❌ Route is not defined!"))
    }
}

/* Handle Errors */
export const handleErrors = function(){
    return (error, req, res, next) => {
        if(error)
            res.status(error.status || 500).json({
                Error: error.message || "Internal Server Error"
            })
        else next();
    }
}