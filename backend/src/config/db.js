const { Pool } = require('pg')

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect((err,client,release) => {
    if(err){
        console.log("Gagal terhubung ke database postgreSQL :", err.stack);
    }else{
        console.log('Berhasil terhubung ke database postgreSQL');
    }

    if(client) release()
})

module.exports = pool;