const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // <-- 1. Importamos la librería CORS
const app = express();
const port = 2626;

// <-- 2. Le decimos a Express que use CORS antes de tus rutas
app.use(cors()); 

// Conectamos a tu base de datos
const db = new sqlite3.Database('./registro_dokploy.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) console.error("Error al abrir la BD:", err.message);
});

app.get('/usuarios', (req, res) => {
    const sql = "SELECT * FROM usuarios";

    // db.all ejecuta la consulta y devuelve todas las filas en un array de objetos (que Express convierte a JSON)
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const ahora = Date.now();
        const usuarios = rows.map((row) => {
            const inicio = row.fecha_inicio
                ? new Date(row.fecha_inicio.replace(' ', 'T')).getTime()
                : NaN;
            const segundos = Math.floor((ahora - inicio) / 1000);

            let tiempo_transcurrido = null;
            if (Number.isFinite(inicio)) {
                const horas = Math.floor(segundos / 3600);
                const minutos = Math.floor((segundos % 3600) / 60);
                const segundosRestantes = segundos % 60;
                tiempo_transcurrido = `${horas}h ${minutos}m ${segundosRestantes}s`;
            }

            return { ...row, tiempo_transcurrido };
        });

        res.json(usuarios);
    });
});

app.listen(port, () => {
    console.log(`Servidor API escuchando en http://localhost:${port}`);
});
