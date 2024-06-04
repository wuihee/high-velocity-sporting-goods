import pathlib
import random
import sqlite3

FOLDER_PATH = "public/img/sneakers"


def generate_data():
    price = round(random.uniform(50, 300))
    availability = random.randrange(3, 30)
    gender = random.choice(["men", "women"])
    return price, availability, gender


def create_database():
    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("DROP TABLE items;")
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image TEXT NOT NULL,
        price REAL NOT NULL,
        availability INTEGER NOT NULL,
        gender TEXT NOT NULL);
        """
    )
    conn.commit()
    return conn, c


def insert_data(conn, c, image_folder):
    for filename in pathlib.Path(image_folder).iterdir():
        price, availability, gender = generate_data()
        name = filename.name.split(".")[0].replace("-", " ").title()
        c.execute(
            """
            INSERT INTO items (name, image, price, availability, gender)
            VALUES (?, ?, ?, ?, ?)
            """,
            (name, str(pathlib.Path(*filename.parts[1:])), price, availability, gender),
        )
    conn.commit()


def generate_items():
    conn, c = create_database()
    insert_data(conn, c, FOLDER_PATH)
    conn.close()


if __name__ == "__main__":
    generate_items()
