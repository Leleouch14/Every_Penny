import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

class DatabaseService {
    constructor() {
        this.sqlite = new SQLiteConnection(CapacitorSQLite);
        this.db = null;
        this.isNative = Capacitor.getPlatform() !== 'web';
    }

    async init() {
        if (!this.isNative) {
            console.log("Running on Web: using localStorage persistence.");
            return;
        }

        try {
            const isConn = (await this.sqlite.isConnection('every_penny_db', false)).result;
            if (isConn) {
                this.db = await this.sqlite.retrieveConnection('every_penny_db', false);
            } else {
                this.db = await this.sqlite.createConnection('every_penny_db', false, 'no-encryption', 1, false);
            }

            await this.db.open();

            const schema = `
                CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY,
                    type TEXT NOT NULL,
                    amount REAL NOT NULL,
                    note TEXT,
                    date TEXT NOT NULL,
                    tag TEXT
                );
                CREATE TABLE IF NOT EXISTS splits (
                    id INTEGER PRIMARY KEY,
                    friend TEXT NOT NULL,
                    amount REAL NOT NULL,
                    direction TEXT NOT NULL,
                    note TEXT,
                    completed INTEGER DEFAULT 0
                );
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT
                );
            `;
            await this.db.execute(schema);
            console.log("Native SQLite database initialized successfully.");
        } catch (err) {
            console.error("Error initializing native SQLite:", err);
        }
    }

    async loadTransactions() {
        if (!this.isNative) {
            return JSON.parse(localStorage.getItem('every_penny_txns')) || [];
        }
        try {
            const res = await this.db.query("SELECT * FROM transactions ORDER BY id DESC;");
            return res.values || [];
        } catch (err) {
            console.error("Failed to load transactions from SQLite:", err);
            return [];
        }
    }

    async saveTransactions(transactions) {
        if (!this.isNative) {
            localStorage.setItem('every_penny_txns', JSON.stringify(transactions));
            return;
        }
        try {
            await this.db.run("DELETE FROM transactions;");
            for (const t of transactions) {
                const query = `INSERT INTO transactions (id, type, amount, note, date, tag) VALUES (?, ?, ?, ?, ?, ?);`;
                const values = [t.id, t.type, t.amount, t.note || '', t.date, t.tag || 'General'];
                await this.db.run(query, values);
            }
        } catch (err) {
            console.error("Failed to save transactions to SQLite:", err);
        }
    }

    async loadSplits() {
        if (!this.isNative) {
            return JSON.parse(localStorage.getItem('every_penny_splits')) || [];
        }
        try {
            const res = await this.db.query("SELECT * FROM splits ORDER BY id DESC;");
            return (res.values || []).map(s => ({ ...s, completed: s.completed === 1 }));
        } catch (err) {
            console.error("Failed to load splits from SQLite:", err);
            return [];
        }
    }

    async saveSplits(splits) {
        if (!this.isNative) {
            localStorage.setItem('every_penny_splits', JSON.stringify(splits));
            return;
        }
        try {
            await this.db.run("DELETE FROM splits;");
            for (const s of splits) {
                const query = `INSERT INTO splits (id, friend, amount, direction, note, completed) VALUES (?, ?, ?, ?, ?, ?);`;
                const values = [s.id, s.friend, s.amount, s.direction, s.note || '', s.completed ? 1 : 0];
                await this.db.run(query, values);
            }
        } catch (err) {
            console.error("Failed to save splits to SQLite:", err);
        }
    }

    async loadBudget() {
        if (!this.isNative) {
            return parseFloat(localStorage.getItem('every_penny_budget')) || 10000;
        }
        try {
            const res = await this.db.query("SELECT value FROM settings WHERE key = 'budget';");
            if (res.values && res.values.length > 0) {
                return parseFloat(res.values[0].value) || 10000;
            }
            return 10000;
        } catch (err) {
            return 10000;
        }
    }

    async saveBudget(budget) {
        if (!this.isNative) {
            localStorage.setItem('every_penny_budget', budget);
            return;
        }
        try {
            const query = `INSERT OR REPLACE INTO settings (key, value) VALUES ('budget', ?);`;
            await this.db.run(query, [budget.toString()]);
        } catch (err) {
            console.error("Failed to save budget to SQLite:", err);
        }
    }
}

export const dbService = new DatabaseService();
