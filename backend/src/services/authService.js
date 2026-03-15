const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/auth');

class AuthService {
    static async createUser(data) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new Error('Email já cadastrado');
        }

        const hashedPassword = await hashPassword(data.password);

        return await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword
            },
            select: {
                id: true,
                name: true,
                email: true,
                plan: true,
                is_active: true,
                created_at: true,
                updated_at: true
            }
        });
    }

    static async authenticateUser(email, password) {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw new Error('Usuário ou senha inválidos');
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            throw new Error('Usuário ou senha inválidos');
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

module.exports = AuthService;
