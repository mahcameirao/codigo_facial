const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.decode(token);

        if (!decoded || !decoded.sub) {
            return res.status(401).json({ error: 'Token inválido ou expirado no Supabase.' });
        }

        req.user = {
            userId: decoded.sub,
            email: decoded.email
        };
        next();
    } catch (error) {
        console.error("Erro decodificando JWT:", error);
        return res.status(401).json({ error: 'Token inválido.' });
    }
};

module.exports = authMiddleware;
