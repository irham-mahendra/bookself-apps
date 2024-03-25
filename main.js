const books = [];
const RENDER_EVENT = "render-book";

const SAVED_EVENT = "BOOK_APPS";
const localStorageKey = "SAVE_BOOK_DATA";

document.addEventListener("DOMContentLoaded", function () {
  function reset() {
    bookSubmit.reset();
    return false;
  }
  const bookSubmit = document.getElementById("inputBook");
  bookSubmit.addEventListener("submit", function (e) {
    e.preventDefault();

    addBook();
    reset();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
function isStorageExist() {
  if (typeof Storage === undefined) {
    swal("Browser Kamu Tidak Mendukung Local Storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(localStorageKey));
});

function addBook() {
  const inputBookTitle = document.getElementById("inputBookTitle").value;
  const inputBookAuthor = document.getElementById("inputBookAuthor").value;
  const inputBookYear = document.getElementById("inputBookYear").value;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    inputBookTitle,
    inputBookAuthor,
    inputBookYear,
    false
  );
  books.unshift(bookObject);
  swal("berhasil menambahkan buku", "", "success");
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveDataBook();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `penulis:${bookObject.author}`;

  const textYear = document.createElement("p");
  textYear.innerText = `tahun: ${bookObject.year}`;

  const textContainer = document.createElement("article");
  textContainer.classList.add("book_item");
  textContainer.append(textTitle, textAuthor, textYear);
  textContainer.setAttribute("id", `todo-${bookObject.id}`);

  const trashButton = document.createElement("button");
  trashButton.innerText = "Hapus Buku";
  trashButton.classList.add("red");
  trashButton.addEventListener("click", function () {
    removeBookFromCompleted(bookObject.id);
  });

  const action = document.createElement("div");
  action.classList.add("action");

  if (bookObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("green");
    undoButton.innerText = "Belum Selesai Dibaca";

    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    action.append(undoButton, trashButton);
    textContainer.append(action);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("green");
    checkButton.innerText = "Selesai Dibaca";

    checkButton.addEventListener("click", function () {
      addBookCompleted(bookObject.id);
    });

    action.append(checkButton, trashButton);
    textContainer.append(action);
  }

  return textContainer;
}

function addBookCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget === null) {
    return;
  }
  swal("Buku Selesai Dibaca", "", "success");
  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveDataBook();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
  swal({
    title: "apakah anda yakin akan menghapus?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      swal("Buku berhasil dihapus!", { icon: "success" });
      if (bookTarget === -1) return;

      books.splice(bookTarget, 1);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveDataBook();
    } else {
      swal("Buku tetap tersimpan", { icon: "success" });
    }
  });
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isCompleted = false;
  swal("Buku belum selesai dibaca", "", "info");
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveDataBook();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function saveDataBook() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(localStorageKey, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializeData = localStorage.getItem(localStorageKey);
  let data = JSON.parse(serializeData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

const searchBook = document.getElementById("searchBook");

searchBook.addEventListener("submit", function (e) {
  e.preventDefault();
  const searchBookTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();

  const bookTitle = document.querySelectorAll(".book_item > h3");
  for (cariBuku of bookTitle) {
    if (cariBuku.innerText.toLowerCase().includes(searchBookTitle)) {
      cariBuku.parentElement.style.display = "block";
    } else {
      cariBuku.parentElement.style.display = "none";
    }
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedBookList.innerHTML = "";

  const completeBookshelfList = document.getElementById(
    "completeBookshelfList"
  );
  completeBookshelfList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBookList.append(bookElement);
    } else {
      completeBookshelfList.append(bookElement);
    }
  }
});
