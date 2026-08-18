const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 2026;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to PROJECT TIM 2 - Mentorship program' });
});

app.get('/api/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW() AS current_time');
        res.json({
            success: true,
            message: 'Query langsung ke database berhasil',
            time: result.rows[0].current_time
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            error: 'Terjadi kesalahan sistem. Coba lagi nanti'
        });
    }
});

app.use('/api/auth', authRoutes);

app.listen(port, () => {
    console.log(`Server sudah berjalan di http://localhost:${port}`);
});
