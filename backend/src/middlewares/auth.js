const { verifyToken } = require('../utils/jwt');
const db = require('../config/db');

async function verifyTokenMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Token tidak ditemukan'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);

        const akunResult = await db.query(
            `SELECT id_akun, nama_lengkap, email, role, status_aktif
             FROM akun
             WHERE id_akun = $1`,
            [decoded.idAkun]
        );

        if (akunResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Akun tidak ditemukan'
            });
        }

        const akun = akunResult.rows[0];

        if (!akun.status_aktif) {
            return res.status(403).json({
                success: false,
                error: 'Akun tidak aktif'
            });
        }

        req.user = {
            idAkun: akun.id_akun,
            namaLengkap: akun.nama_lengkap,
            email: akun.email,
            role: akun.role
        };

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token kadaluarsa'
            });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Token tidak valid'
            });
        }
        console.error('Auth middleware error:', err);
        return res.status(500).json({
            success: false,
            error: 'Terjadi kesalahan sistem. Coba lagi nanti'
        });
    }
}

function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Akses ditolak: hanya untuk admin'
        });
    }
    next();
}

module.exports = {
    verifyTokenMiddleware,
    requireAdmin
};