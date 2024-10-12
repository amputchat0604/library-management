document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('allBooksButton').addEventListener('click', function() {
        const allBookDisplay = document.getElementById('allBookDisplay');

        fetch('http://localhost:5000/books')
            .then(response => response.json())
            .then(data => {
                let booksList = data.books.map(book => `
                    <div class="list-book">
                        <p class="book-icon"><i class="fa-solid fa-book"></i></p>
                        <p><strong>${book.title}</strong></p>
                        <p>ISBN: ${book.isbn}</p>
                    </div>
                `).join('');
                allBookDisplay.innerHTML = booksList || '<p class="error">No books available.</p>';
                allBookDisplay.style.display = allBookDisplay.style.display === 'none' || allBookDisplay.style.display === '' ? 'block' : 'none';
            });
    });

    document.getElementById('isbnForm').addEventListener('submit', function(e) {
        e.preventDefault();
        let isbn = document.getElementById('isbn').value;

        const searchBookDisplay = document.getElementById('searchBookInfo');
        searchBookDisplay.style.display = searchBookDisplay.style.display === 'none' || searchBookDisplay;

        fetch(`http://localhost:5000/book/${isbn}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    searchBookDisplay.innerText = "Book not found.";
                } else {
                    searchBookDisplay.innerHTML = `
                    <div class="list-search-book">
                        <p class="book-icon"><i class="fa-solid fa-book"></i></p>
                        <p>Title: ${data.title}</p>
                        <p>Author: ${data.author}</p>
                        <p>Year: ${data.year}</p>
                    </div>
                    `;
                }
            });
    });

    document.getElementById('addBookForm').addEventListener('submit', function(e) {
        e.preventDefault();
        let isbn = document.getElementById('addIsbn').value;
        let title = document.getElementById('addTitle').value;
        let author = document.getElementById('addAuthor').value;
        let year = document.getElementById('addYear').value;

        fetch('http://localhost:5000/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isbn: isbn,
                title: title,
                author: author,
                year: year
            })
        }).then(response => response.json())
          .then(data => alert(data.message));
    });

    document.getElementById('deleteBookForm').addEventListener('submit', function(e) {
        e.preventDefault();
        let isbn = document.getElementById('deleteIsbn').value;

        fetch(`http://localhost:5000/book/${isbn}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => alert(data.message || data.error));
    });

    document.getElementById('favoriteBookForm').addEventListener('submit', function(e) {
        e.preventDefault();
        let isbn = document.getElementById('favoriteIsbn').value;

        fetch(`http://localhost:5000/book/${isbn}/favorite`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => alert(data.message || data.error));
    });

    document.getElementById('viewFavoritesButton').addEventListener('click', function() {
        const favBookDisplay = document.getElementById('favoriteBooks');

        fetch('http://localhost:5000/book/favorites')
            .then(response => response.json())
            .then(data => {
                let favoritesList = data.map(book => `
                    <div class="list-fav-book">
                        <p class="book-icon"><i class="fa-solid fa-book"></i></p>
                        <p><strong>${book.title}</strong></p>
                        <p>ISBN: ${book.isbn}</p>
                    </div>
                `).join('');
                
                favBookDisplay.innerHTML = favoritesList || '<p class="error">No favorite books found.</p>';
                favBookDisplay.style.display = favBookDisplay.style.display === 'none' || favBookDisplay.style.display === '' ? 'block' : 'none';
            });
    });
});
