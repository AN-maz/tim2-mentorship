const { comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const db = require('../config/db');

class AuthService {
    async login(email, password) {
        try {
            const result = await db.query(
                `SELECT id_akun, nama_lengkap, email, kata_sandi_hash, role, status_aktif
                 FROM akun
                 WHERE email = $1`,
                [email]
            );

            if (result.rows.length === 0) {
                throw { statusCode: 401, message: 'Email atau password salah' };
            }

            const akun = result.rows[0];

            if (!akun.status_aktif) {
                throw { statusCode: 403, message: 'Akun tidak aktif' };
            }

            if (akun.role === 'admin') {
                const token = generateToken({
                    idAkun: akun.id_akun,
                    namaLengkap: akun.nama_lengkap,
                    email: akun.email,
                    role: akun.role
                });

                return {
                    token,
                    user: {
                        id: akun.id_akun,
                        namaLengkap: akun.nama_lengkap,
                        email: akun.email,
                        role: akun.role,
                        statusAktif: akun.status_aktif
                    }
                };
            }

            const passwordMatch = await comparePassword(password, akun.kata_sandi_hash);

            if (!passwordMatch) {
                throw { statusCode: 401, message: 'Email atau password salah' };
            }

            const token = generateToken({
                idAkun: akun.id_akun,
                namaLengkap: akun.nama_lengkap,
                email: akun.email,
                role: akun.role
            });

            return {
                token,
                user: {
                    id: akun.id_akun,
                    namaLengkap: akun.nama_lengkap,
                    email: akun.email,
                    role: akun.role,
                    statusAktif: akun.status_aktif
                }
            };
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new AuthService();
