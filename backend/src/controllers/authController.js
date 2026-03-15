const AuthService = require('../services/authService');
const { generateToken } = require('../utils/auth');
const { registerSchema, loginSchema } = require('../utils/validators');

class AuthController {
    static async register(req, res, next) {
        try {
            const validatedData = registerSchema.parse(req.body);
            const user = await AuthService.createUser(validatedData);
            const token = generateToken(user);

            res.status(201).json({
                success: true,
                data: user,
                token
            });
        } catch (error) {
            next(error);
        }
    }

    static async login(req, res, next) {
        try {
            const validatedData = loginSchema.parse(req.body);
            const user = await AuthService.authenticateUser(validatedData.email, validatedData.password);
            const token = generateToken(user);

            res.status(200).json({
                success: true,
                data: user,
                token
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
