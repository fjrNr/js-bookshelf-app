const storage_key = 'STORAGE_KEY';
let book_list = [];

function switchBookshelf(status) {
    if(status == 'not-yet') {
        document.getElementById('tab-not-yet').style.display = 'block';
        document.getElementById('tab-done').style.display = 'none';
    } else {
        document.getElementById('tab-not-yet').style.display = 'none';
        document.getElementById('tab-done').style.display = 'block';
    }    
}

function openModal() {
    const form = document.forms['book-form'];

    form['title'].value = '';
    form['author'].value = '';
    form['year'].value = '';
    form['isComplete'].checked = false;
    document.getElementById('modal').classList.add('open');
    document.body.classList.add('jw-modal-open');
}

function closeModal() {
    document.querySelector('.jw-modal.open').classList.remove('open');
    document.body.classList.remove('jw-modal-open');
}

function checkStorage() {
    return typeof (Storage) !== 'undefined';
}

function putBookList (book) {
    book_list.push(book);
    localStorage.setItem(storage_key, JSON.stringify(book_list));
    alert('Buku berhasil ditambahkan: ' + book['title']);
}

function getBookList() {
    if (checkStorage()) {
        return JSON.parse(localStorage.getItem(storage_key)) || [];
    } else {
        return [];
    }
}

function renderBookList(data_list) { 
    const book_not_yet_list_elem = document.getElementById('book-not-yet-list');
    const book_done_list_elem = document.getElementById('book-done-list');

    book_not_yet_list_elem.innerHTML = '';
    book_done_list_elem.innerHTML = '';

    for (book of data_list) {
        const item = document.createElement('div');
        item.innerHTML = '<h3>' + book.title + '</h3>';
        item.innerHTML += '<h4>' + book.author + '</h4>';
        item.innerHTML += '<h4>' + book.year + '</h4>';
        item.classList.add('book-item');
        item.setAttribute('id', book.id);
        
        if (book.isComplete) {
            item.innerHTML += '<div class="btn-group"><button class="btn-undo"> <img src="images/ic_undo.svg" alt="btn-done" width="100%"> </button> <button class="btn-delete"> <img src="images/ic_delete.svg" alt="btn-delete" width="100%"> </button></div>';
            book_done_list_elem.appendChild(item);
        } else {
            item.innerHTML += '<div class="btn-group"><button class="btn-done"> <img src="images/ic_done.svg" alt="btn-done" width="100%"> </button> <button class="btn-delete"> <img src="images/ic_delete.svg" alt="btn-delete" width="100%"> </button></div>';
            book_not_yet_list_elem.appendChild(item);
        }
    }

    for (let btn of document.querySelectorAll('.btn-done')) {
        let id = btn.parentElement.parentElement.getAttribute('id');
        btn.addEventListener('click', () => doneBook(id));
    }

    for (let btn of document.querySelectorAll('.btn-undo')) {
        let id = btn.parentElement.parentElement.getAttribute('id');
        btn.addEventListener('click', () => undoBook(id));
    }

    for (let btn of document.querySelectorAll('.btn-delete')) {
        let id = btn.parentElement.parentElement.getAttribute('id');
        btn.addEventListener('click', () => deleteBook(id));
    }
}

function doneBook (targetId) {
    const index = book_list.findIndex(({id}) => id == targetId);
    book_list[index].isComplete = true;
    localStorage.setItem(storage_key, JSON.stringify(book_list));

    alert('Selesai dibaca: '+ book_list[index].title);
    searchBook();
}

function undoBook (targetId) {
    const index = book_list.findIndex(({id}) => id == targetId);
    book_list[index].isComplete = false;
    localStorage.setItem(storage_key, JSON.stringify(book_list));

    alert('Belum selesai dibaca: '+ book_list[index].title);
    searchBook();
}

function deleteBook (targetId) {
    const index = book_list.findIndex(({id}) => id == targetId);
    const title = book_list[index].title;

    if (confirm('Apakah anda ingin menghapus buku berjudul '+ title +' ?')) {
        book_list.splice(index, 1);
        localStorage.setItem(storage_key, JSON.stringify(book_list));

        alert('Terhapus: '+ title);
        searchBook();
    }
}

function searchBook () {
    const text = document.getElementById('txt-search').value;
    const result = book_list.filter((book) => book.title.toLowerCase().indexOf(text.toLowerCase()) !== -1);
    
    renderBookList(result);
    if(text == ''){
        book_list = getBookList();
        renderBookList(book_list);
    }
}

document.querySelector('[name=book-form]').addEventListener('submit', function(e) {
    e.preventDefault();

    const form = document.forms['book-form'];
    const new_book_data = {
        id: +new Date(),
        title: form['title'].value,
        author: form['author'].value,
        year: parseInt(form['year'].value),
        isComplete: form['isComplete'].checked,
    }

    putBookList(new_book_data);
    closeModal();
    searchBook();
});

window.addEventListener('load', function() {
    if (checkStorage) {
        if (localStorage.getItem(storage_key) !== null && localStorage.getItem(storage_key) !== '') {
            book_list = getBookList();
            renderBookList(book_list);
        } else {
            alert('Tidak ada buku yang ditambahkan!');
        }
    } else {
        alert('Browser yang Anda gunakan tidak mendukung Web Storage');
    }

    document.addEventListener('click', event => {
        if (event.target.classList.contains('jw-modal')) {
            closeModal();
        }
    });
});

document.getElementById('nav-not-yet').addEventListener('click', () => switchBookshelf('not-yet'));
document.getElementById('nav-done').addEventListener('click', () => switchBookshelf('done'));
document.getElementById('txt-search').addEventListener('keyup', searchBook);
document.getElementById('btn-add').addEventListener('click', openModal);