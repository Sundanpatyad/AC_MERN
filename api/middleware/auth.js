// AUTH , IS STUDENT , IS INSTRUCTOR , IS ADMIN

const jwt = require("jsonwebtoken");
require('dotenv').config();


// ================ AUTH ================
// user Authentication by checking token validating
exports.auth = (req, res, next) => {
    try {
        // Prefer Authorization header. Body `token` is often an FCM device token
        // (e.g. POST /notifications/register), not a JWT.
        const authHeader = req.header('Authorization') || req.header('authorization');
        const headerToken = authHeader?.replace(/^Bearer\s+/i, '').trim();
        const token = headerToken || req.cookies?.token || null;
        
        console.log(`[Auth Middleware] URL: ${req.originalUrl}, Method: ${req.method}`);
        console.log(`[Auth Middleware] Auth Header Present: ${!!authHeader}`);

        // If token is missing
        if (!token) {
            console.log('[Auth] Token is Missing');
            return res.status(401).json({
                success: false,
                message: 'Token is Missing - Authorization header might be missing'
            });
        }

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log('[Auth] Token verification failed:', err.message);
                return res.status(401).json({
                    success: false,
                    message: 'Error while decoding token',
                    error: err.message
                });
            }

            // Attach decoded token to request object
            req.user = decoded;
            console.log("[Auth] Token verified for user:", decoded.email, "Role:", decoded.accountType);

            // Proceed to the next middleware
            next();
        });
    } catch (error) {
        console.error('[Auth] Internal error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error while validating token',
            error: error.message
        });
    }
};





// ================ IS STUDENT ================
exports.isStudent = (req, res, next) => {
    try {
        // //console.log('User data -> ', req.user)
        if (req.user?.accountType != 'Student') {
            return res.status(401).json({
                success: false,
                message: `This Page is protected only for students. Current role: ${req.user?.accountType}`
            })
        }
        // go to next middleware
        next();
    }
    catch (error) {
        //console.log('Error while cheching user validity with student accountType');
        //console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            messgae: 'Error while cheching user validity with student accountType'
        })
    }
}


// ================ IS INSTRUCTOR ================
exports.isInstructor = (req, res, next) => {
    try {
        // //console.log('User data -> ', req.user)
        if (req.user?.accountType != 'Instructor') {
            return res.status(401).json({
                success: false,
                messgae: 'This Page is protected only for Instructor'
            })
        }
        // go to next middleware
        next();
    }
    catch (error) {
        //console.log('Error while cheching user validity with Instructor accountType');
        //console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            messgae: 'Error while cheching user validity with Instructor accountType'
        })
    }
}


// ================ IS ADMIN ================
exports.isAdmin = (req, res, next) => {
    try {
        // //console.log('User data -> ', req.user)
        if (req.user.accountType != 'Admin') {
            return res.status(401).json({
                success: false,
                messgae: 'This Page is protected only for Admin'
            })
        }
        // go to next middleware
        next();
    }
    catch (error) {
        //console.log('Error while cheching user validity with Admin accountType');
        //console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            messgae: 'Error while cheching user validity with Admin accountType'
        })
    }
}


// ================ IS ADMIN OR INSTRUCTOR ================
exports.isAdminOrInstructor = (req, res, next) => {
    try {
        const type = req.user?.accountType;
        if (type !== 'Admin' && type !== 'Instructor') {
            return res.status(401).json({
                success: false,
                message: 'This page is protected for Admin or Instructor only',
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while checking Admin/Instructor accountType',
        });
    }
}


