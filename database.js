
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./contactos.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS contactos (
        id INTEGER PRIMARY KEY,
        nombre TEXT,
        domicilio TEXT,
        correo TEXT,
        telefono TEXT
    )`);
});

function getAvailableId(callback) {
    db.all("SELECT id FROM contactos ORDER BY id", (err, rows) => {
        if (err) return callback(err);
        let expected = 1;
        for (let row of rows) {
            if (row.id !== expected) break;
            expected++;
        }
        callback(null, expected);
    });
}

module.exports = { db, getAvailableId };
