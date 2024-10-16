from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)

def connectDb():
    conn = psycopg2.connect(
        host="db",
        database="library_management",
        user="postgres",
        password="1234"
    )
    return conn

def initBooksTable():
    conn = connectDb()
    cursor = conn.cursor()

    create_table_query = """
    CREATE TABLE IF NOT EXISTS books (
        isbn VARCHAR(17) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        year INTEGER CHECK (year >= 1000 AND year <= EXTRACT(YEAR FROM CURRENT_DATE)),
        is_favorite BOOLEAN DEFAULT FALSE
    );
    """
    cursor.execute(create_table_query)
    conn.commit()
    conn.close()

@app.route('/book/<isbn>', methods=['GET'])
def getBook(isbn):
    conn = connectDb()
    cursor = conn.cursor()

    query = "SELECT title, author, year, is_favorite FROM books WHERE isbn = %s;"
    cursor.execute(query, (isbn,))
    book = cursor.fetchone()

    conn.close()

    if book:
        return jsonify({
            "title": book[0],
            "author": book[1],
            "year": book[2],
            "is_favorite": book[3]
        })
    else:
        return jsonify({"error": "Book not found"}), 404
    
@app.route('/books', methods=['GET'])
def getBooks():
    conn = connectDb()
    cursor = conn.cursor()

    query = "SELECT isbn, title, author, year FROM books;"
    cursor.execute(query)
    books = cursor.fetchall()
    conn.close()

    books_list = []
    for book in books:
        books_list.append({
            "isbn": book[0],
            "title": book[1],
            "author": book[2],
            "year": book[3]
        })

    return jsonify({"books": books_list}), 200

@app.route('/book', methods=['POST'])
def insertBook():
    data = request.json
    isbn = data['isbn']
    title = data['title']
    author = data['author']
    year = data['year']

    conn = connectDb()
    cursor = conn.cursor()

    query = """
    INSERT INTO books (isbn, title, author, year, is_favorite) 
    VALUES (%s, %s, %s, %s, FALSE);
    """
    try:
        cursor.execute(query, (isbn, title, author, year))
        conn.commit()
        return jsonify({"message": "Book added successfully"}), 201
    except psycopg2.IntegrityError as e:
        conn.rollback()
        error_message = str(e)
        
        if 'books_pkey' in error_message:
            return jsonify({"error": "A book with this ISBN already exists"}), 409
        elif 'check constraint' in error_message and 'books_year_check' in error_message:
            return jsonify({"error": "Year must be between 1000 and the current year"}), 400
        else:
            return jsonify({"error": f"Failed : ${error_message}"}), 400
    finally:
        conn.close()

@app.route('/book/<isbn>', methods=['DELETE'])
def deleteBook(isbn):
    conn = connectDb()
    cursor = conn.cursor()

    query = "DELETE FROM books WHERE isbn = %s;"
    cursor.execute(query, (isbn,))
    conn.commit()
    conn.close()

    if cursor.rowcount > 0:
        return jsonify({"message": "Book deleted successfully"}), 200
    else:
        return jsonify({"error": "Book not found"}), 404

@app.route('/book/<isbn>/favorite', methods=['POST'])
def markFavorite(isbn):
    conn = connectDb()
    cursor = conn.cursor()

    query = "UPDATE books SET is_favorite = TRUE WHERE isbn = %s;"
    cursor.execute(query, (isbn,))
    conn.commit()
    conn.close()

    if cursor.rowcount > 0:
        return jsonify({"message": "Book marked as favorite"}), 200
    else:
        return jsonify({"error": "Book not found"}), 404

@app.route('/book/favorites', methods=['GET'])
def getFavorites():
    conn = connectDb()
    cursor = conn.cursor()

    query = "SELECT isbn, title, author, year FROM books WHERE is_favorite = TRUE;"
    cursor.execute(query)
    favorites = cursor.fetchall()
    conn.close()

    favorite_books = []
    for book in favorites:
        favorite_books.append({
            "isbn": book[0],
            "title": book[1],
            "author": book[2],
            "year": book[3]
        })

    return jsonify(favorite_books), 200

if __name__ == "__main__":
    initBooksTable()
    app.run(host="0.0.0.0", port=5000)
