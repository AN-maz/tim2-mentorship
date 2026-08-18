const authService = require('../services/authService');

class AuthController {
    async login(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email dan password wajib diisi'
            });
        }

        try {
            const result = await authService.login(email, password);

            return res.status(200).json({
                success: true,
                token: result.token,
                user: result.user
            });
        } catch (err) {
            const statusCode = err.statusCode || 500;
            const message = err.statusCode
                ? err.message
                : 'Terjadi kesalahan sistem. Coba lagi nanti';

            return res.status(statusCode).json({
                success: false,
                error: message
            });
        }
    }
}

module.exports = new AuthController();
