from flask import Flask, jsonify, request
import psycopg2

app = Flask(__name__)

def connect_db():
    conn = psycopg2.connect(
        host="db",
        database="library_management",
        user="postgres",
        password="1234"
    )
    return conn

@app.route('/book/<isbn>', methods=['GET'])
def get_book(isbn):
    conn = connect_db()
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
def get_books():
    conn = connect_db()
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
def insert_book():
    data = request.json
    isbn = data['isbn']
    title = data['title']
    author = data['author']
    year = data['year']

    conn = connect_db()
    cursor = conn.cursor()

    # Insert book with is_favorite set to FALSE by default
    query = "INSERT INTO books (isbn, title, author, year, is_favorite) VALUES (%s, %s, %s, %s, FALSE);"
    try:
        cursor.execute(query, (isbn, title, author, year))
        conn.commit()
        return jsonify({"message": "Book added successfully"}), 201
    except psycopg2.IntegrityError:
        conn.rollback()
        return jsonify({"error": "Book with this ISBN already exists"}), 409
    finally:
        conn.close()

@app.route('/book/<isbn>', methods=['DELETE'])
def delete_book(isbn):
    conn = connect_db()
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
def mark_favorite(isbn):
    conn = connect_db()
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
def get_favorites():
    conn = connect_db()
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
    app.run(host="0.0.0.0", port=5000)
