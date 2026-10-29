const express = require('express');
const path = require('path');
const { Pool, types } = require('pg');

// NUMERIC (oid 1700) llega como texto desde PostgreSQL; lo convertimos a número
types.setTypeParser(1700, parseFloat);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'agrimind',
  password: process.env.DB_PASSWORD || 'agrimind_pass',
  database: process.env.DB_NAME || 'agrimind',
});
pool.on('error', (err) => console.error('Error en la conexión con la base de datos:', err.message));

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ESTADOS = ['verde', 'amarillo', 'rojo'];

// Valida y normaliza el cuerpo de la petición
function validar(body = {}) {
  const nombre = String(body.nombre ?? '').trim();
  const cultivo = String(body.cultivo ?? '').trim();
  const superficie = Number(body.superficie_ha);
  const humedad = Number(body.humedad_suelo);
  const estado = String(body.estado ?? 'verde');
  const notas = String(body.notas ?? '').trim();

  if (!nombre) return { error: 'El nombre es obligatorio.' };
  if (!cultivo) return { error: 'El cultivo es obligatorio.' };
  if (!Number.isFinite(superficie) || superficie <= 0) return { error: 'La superficie debe ser mayor que 0.' };
  if (!Number.isFinite(humedad) || humedad < 0 || humedad > 100) return { error: 'La humedad debe estar entre 0 y 100.' };
  if (!ESTADOS.includes(estado)) return { error: 'El estado debe ser verde, amarillo o rojo.' };

  return { datos: [nombre, cultivo, superficie, humedad, estado, notas] };
}

function leerId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Identificador no válido.' });
    return null;
  }
  return id;
}

function manejarError(res, err) {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
}

// Listar
app.get('/api/parcelas', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM parcelas ORDER BY id');
    res.json(rows);
  } catch (err) { manejarError(res, err); }
});

// Crear
app.post('/api/parcelas', async (req, res) => {
  const { error, datos } = validar(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const { rows } = await pool.query(
      `INSERT INTO parcelas (nombre, cultivo, superficie_ha, humedad_suelo, estado, notas)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      datos
    );
    res.status(201).json(rows[0]);
  } catch (err) { manejarError(res, err); }
});

// Editar
app.put('/api/parcelas/:id', async (req, res) => {
  const id = leerId(req, res);
  if (id === null) return;
  const { error, datos } = validar(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const { rows } = await pool.query(
      `UPDATE parcelas
       SET nombre = $1, cultivo = $2, superficie_ha = $3, humedad_suelo = $4, estado = $5, notas = $6
       WHERE id = $7 RETURNING *`,
      [...datos, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Parcela no encontrada.' });
    res.json(rows[0]);
  } catch (err) { manejarError(res, err); }
});

// Borrar
app.delete('/api/parcelas/:id', async (req, res) => {
  const id = leerId(req, res);
  if (id === null) return;
  try {
    const { rowCount } = await pool.query('DELETE FROM parcelas WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Parcela no encontrada.' });
    res.status(204).end();
  } catch (err) { manejarError(res, err); }
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`AgriMind AI escuchando en el puerto ${PORT}`));
