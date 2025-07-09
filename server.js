
const express = require('express');
const bodyParser = require('body-parser');
const { db, getAvailableId } = require('./database');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Mostrar todos los contactos
app.get('/', (req, res) => {
    db.all('SELECT * FROM contactos ORDER BY id ASC', (err, rows) => {
        if (err) throw err;
        res.render('index', { contactos: rows });
    });
});

// Formulario para agregar
app.get('/add', (req, res) => {
    res.render('form', { contacto: {}, action: '/add' });
});

// Agregar contacto (con ID reutilizable)
app.post('/add', (req, res) => {
    const { nombre, domicilio, correo, telefono } = req.body;
    getAvailableId((err, newId) => {
        if (err) return res.status(500).send("Error obteniendo ID.");
        db.run(
            `INSERT INTO contactos (id, nombre, domicilio, correo, telefono) VALUES (?, ?, ?, ?, ?)`,
            [newId, nombre, domicilio, correo, telefono],
            (err) => {
                if (err) throw err;
                res.redirect('/');
            }
        );
    });
});

// Formulario para editar
app.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM contactos WHERE id = ?', [id], (err, row) => {
        if (err) throw err;
        res.render('form', { contacto: row, action: '/edit/' + id });
    });
});

// Editar contacto
app.post('/edit/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, domicilio, correo, telefono } = req.body;
    db.run(
        'UPDATE contactos SET nombre = ?, domicilio = ?, correo = ?, telefono = ? WHERE id = ?',
        [nombre, domicilio, correo, telefono, id],
        (err) => {
            if (err) throw err;
            res.redirect('/');
        }
    );
});

// Eliminar contacto
app.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM contactos WHERE id = ?', [id], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Formulario de búsqueda
app.get('/buscar', (req, res) => {
    res.render('buscar', { contacto: null });
});

// Buscar contacto individual
app.post('/buscar', (req, res) => {
    const id = req.body.id;
    db.get('SELECT * FROM contactos WHERE id = ?', [id], (err, row) => {
        if (err) throw err;
        res.render('buscar', { contacto: row });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
