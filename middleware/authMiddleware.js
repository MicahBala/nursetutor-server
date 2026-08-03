import admin from 'firebase-admin';

// General Guard: Must be a logged-in user
export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token with Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Attach the user's Firebase details to the request so the controller can use it
        req.user = decodedToken;

        next(); // The user is legit, let them through to the controller!
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
};

// Strict Admin Guard: Must be Micah!
export const requireAdmin = async (req, res, next) => {
    // First, they must pass the standard auth check
    requireAuth(req, res, () => {
        // Then, we check if the verified email matches yours
        if (req.user.email !== 'micahkulien@gmail.com') {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
        next(); // It is you, let you through!
    });
};