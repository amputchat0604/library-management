document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('allBooksButton').addEventListener('click', function() {
        const allBookDisplay = document.getElementById('allBookDisplay');
        const button = document.getElementById('allBooksButton');
        if (allBookDisplay.innerHTML === '') {
            fetch('http://localhost:5000/books')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    let booksList = data.books.map(book => `
                        <div class="list-book">
                            <p class="book-icon"><i class="fa-solid fa-book"></i></p>
                            <div class="book-details">
                                <p><strong>${book.title}</strong></p>
                                <p>ISBN: ${book.isbn}</p>
                            </div>
                        </div>
                    `).join('');
                    allBookDisplay.style.display = 'block'
                    allBookDisplay.innerHTML = booksList || '<p class="error">No books available.</p>';
                    button.textContent = 'Hide List';
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                    allBookDisplay.innerHTML = '<p class="error">Failed to load books.</p>';
                });
        } else {
            allBookDisplay.innerHTML = '';
            button.textContent = 'Show all books';
            allBookDisplay.style.display = 'none'
        }
    });
    

    document.getElementById('isbnForm').addEventListener('submit', function(e) {
        e.preventDefault();
        let isbn = document.getElementById('isbn').value;

        const searchBookDisplay = document.getElementById('searchBookInfo');

        fetch(`http://localhost:5000/book/${isbn}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showModal(data.error)
                } else {
                    searchBookDisplay.style.display = 'block'
                    searchBookDisplay.innerHTML = `
                    <div class="list-search-book">
                        <p class="book-icon"><i class="fa-solid fa-book"></i></p>
                        <div class="book-details">
                                <p>Title : ${data.title}</p>
                                <p>Author : ${data.author}</p>
                                <p>Year : ${data.year}</p>
                        </div>
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
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) showModal(data.message)
            else showModal(data.error)
        });
    });
    
    document.getElementById('deleteBookForm').addEventListener('submit', function(e) {
        e.preventDefault();
        let isbn = document.getElementById('deleteIsbn').value;

        fetch(`http://localhost:5000/book/${isbn}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) showModal(data.message)
            else showModal(data.error)
            });
    });

    document.getElementById('favoriteBookForm').addEventListener('submit', function(e) {
        e.preventDefault();
        let isbn = document.getElementById('favoriteIsbn').value;

        fetch(`http://localhost:5000/book/${isbn}/favorite`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) showModal(data.message)
            else showModal(data.error)
        });
    });

    document.getElementById('viewFavoritesButton').addEventListener('click', function() {
        const favBookDisplay = document.getElementById('favoriteBooks');
        const button = document.getElementById('viewFavoritesButton');

        if (favBookDisplay.innerHTML === ''){
            fetch('http://localhost:5000/book/favorites')
                .then(response => response.json())
                .then(data => {
                    let favoritesList = data.map(book => `
                        <div class="list-book">
                                <p class="book-icon"><i class="fa-solid fa-book"></i></p>
                                <div class="book-details">
                                    <p><strong>${book.title}</strong></p>
                                    <p>ISBN: ${book.isbn}</p>
                                </div>
                            </div>
                    `).join('');
                    if (favoritesList){
                        favBookDisplay.innerHTML = favoritesList
                        favBookDisplay.style.display = 'block'
                        button.textContent = "Hide"
                    }
                    else{
                        showModal("No favourite book found")
                    }
                    

                });
        }
        else{
            favBookDisplay.innerHTML = '';
            button.textContent = 'Show favourite books';
            favBookDisplay.style.display = 'none'
        }
    });

    document.getElementById('closeModalButton').addEventListener('click', function() {
        const modal = document.getElementById('messageModal');
        modal.style.display = 'none';
    });
});

function showModal(message) {
    const modal = document.getElementById('messageModal');
    const modalMessage = document.getElementById('modalMessage');
    modalMessage.innerText = message;
    modal.style.display = 'block';
}


