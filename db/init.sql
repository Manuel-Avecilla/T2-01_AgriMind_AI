CREATE TABLE IF NOT EXISTS parcelas (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  cultivo       VARCHAR(100) NOT NULL,
  superficie_ha NUMERIC(8,2) NOT NULL CHECK (superficie_ha > 0),
  humedad_suelo NUMERIC(5,2) NOT NULL CHECK (humedad_suelo BETWEEN 0 AND 100),
  estado        VARCHAR(10)  NOT NULL DEFAULT 'verde' CHECK (estado IN ('verde', 'amarillo', 'rojo')),
  notas         TEXT NOT NULL DEFAULT ''
);

INSERT INTO parcelas (nombre, cultivo, superficie_ha, humedad_suelo, estado, notas) VALUES
  ('Parcela 1', 'Olivar',  6.50, 41.0, 'verde',    'Riego programado con normalidad.'),
  ('Parcela 2', 'Girasol', 3.20, 27.5, 'amarillo', 'Humedad en descenso, vigilar esta semana.'),
  ('Parcela 3', 'Trigo',   8.00, 14.0, 'rojo',     'Estrés hídrico: regar cuanto antes.');
