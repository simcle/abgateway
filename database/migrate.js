const initDB = require('./connection.js');

const migrateTable = async () => {
    const db = await initDB();
    try {
        // Daftar tabel yang akan dibuat
        const tables = [
            {
                name: 'print_data_logs',
                schema: `
                    CREATE TABLE IF NOT EXISTS print_data_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        created_at TEXT DEFAULT (DATETIME('now', 'localtime')),
                        data TEXT NOT NULL
                    )
                `,
            },
            {
                name: 'print_status_logs',
                schema: `
                    CREATE TABLE IF NOT EXISTS print_status_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        created_at TEXT DEFAULT (DATETIME('now', 'localtime')),
                        data TEXT NOT NULL
                    )
                `,
            },
            {
                name: 'plc_data_logs',
                schema: `
                    CREATE TABLE IF NOT EXISTS plc_data_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        created_at TEXT DEFAULT (DATETIME('now', 'localtime')),
                        data TEXT NOT NULL
                    )
                `,
            },
            {
                name: 'plc_status_logs',
                schema: `
                    CREATE TABLE IF NOT EXISTS plc_status_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        created_at TEXT DEFAULT (DATETIME('now', 'localtime')),
                        data TEXT NOT NULL
                    )
                `,
            },
        ];

        // Eksekusi pembuatan tabel
        for (const table of tables) {
            await db.exec(table.schema);
            console.log(`Table "${table.name}" created successfully.`);
        }
    } catch (error) {
        console.error('Migration failed:', error.message);
    } finally {
        // Pastikan koneksi database ditutup
        await db.close();
        console.log('Database connection closed.');
    }
};

module.exports = migrateTable;