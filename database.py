import sqlite3
import os

def get_connection():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_dir = os.environ.get("FLET_APP_DATA", base_dir)
    db_path = os.path.join(db_dir, "my.db")
    return sqlite3.connect(db_path, check_same_thread=False)

def init_db():
    conn = get_connection()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                Date TEXT, 
                Amount REAL, 
                Note TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS earnings (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                Date TEXT, 
                Amount REAL, 
                Note TEXT
            )
        """)
    conn.close()

def add_expense(date_str: str, amount: float, note: str):
    conn = get_connection()
    with conn:
        conn.execute("INSERT INTO expenses (Date, Amount, Note) VALUES (?, ?, ?)", (date_str, amount, note))
    conn.close()

def add_earning(date_str: str, amount: float, note: str):
    conn = get_connection()
    with conn:
        conn.execute("INSERT INTO earnings (Date, Amount, Note) VALUES (?, ?, ?)", (date_str, amount, note))
    conn.close()

def fetch_expenses():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, Date, Note, Amount FROM expenses ORDER BY id DESC")
    records = cursor.fetchall()
    conn.close()
    return records

def fetch_earnings():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, Date, Note, Amount FROM earnings ORDER BY id DESC")
    records = cursor.fetchall()
    conn.close()
    return records

def fetch_total_expenses():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT SUM(Amount) FROM expenses")
    row = cursor.fetchone()
    conn.close()
    return float(row[0]) if row and row[0] is not None else 0.0

def fetch_current_month_expenses(month_suffix: str):
    """Sum Amount for expenses whose Date ends with month_suffix,
    e.g. month_suffix='-09-2026' matches dates like '16-09-2026'."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT SUM(Amount) FROM expenses WHERE Date LIKE ?", (f"%{month_suffix}",))
    row = cursor.fetchone()
    conn.close()
    return float(row[0]) if row and row[0] is not None else 0.0

def fetch_expense_dates_and_amounts():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT Date, Amount FROM expenses")
    records = cursor.fetchall()
    conn.close()
    return records