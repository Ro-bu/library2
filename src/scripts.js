import "./styles.css";
import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, getDocs, doc, collection, deleteDoc, updateDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut} from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyAeTqjxtqY30KCasmc8YWUCer_cl7YIYt8",
  authDomain: "library-app-86255.firebaseapp.com",
  projectId: "library-app-86255",
  storageBucket: "library-app-86255.appspot.com",
  messagingSenderId: "479155037112",
  appId: "1:479155037112:web:ee6934f389dfd92970a54d",
  measurementId: "G-BVLTWDV87X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// SET AND RETRIEVE DATA

const db = getFirestore(app);

function setBook(book) {
    const uid = sessionStorage.getItem("uid");
    const bookTag = book.title + book.author;
    const docRef = doc(db, "users", uid, "books", bookTag);
    

    const data = {...book};
    setDoc(docRef, data)
        .then(() => {
            console.log("data added")
        })
        .catch((error) => {
            console.log(error)
        })

}

function changeRead(docName, isRead) {
    const uid = sessionStorage.getItem("uid");
    const docRef = doc(db, "users", uid, "books", docName);
    let newRead
    if(isRead === "READ") {
        newRead = "UNREAD"
    } else {
        newRead = "READ"
    }
    const data = {
        read: newRead
    }
    updateDoc(docRef, data)
        .then(() => {
            console.log("read status changed");
        })
        .catch((error) => {
            console.log(error);
        })
    resetUi();
}

function deleteBook(docName) {
    const uid = sessionStorage.getItem("uid");
    const docRef = doc(db, "users", uid, "books", docName);

    deleteDoc(docRef)
        .then(() => {
            console.log("book removed");
        })
        .catch((error) => {
            console.log(error);
        })
    resetUi();
}

async function getBooks() {
    const uid = sessionStorage.getItem("uid");

    const querySnapShot = await getDocs(collection(db, "users", uid, "books"));
    querySnapShot.forEach((doc) =>{
        newBookCard(doc.data())
    })
    addCardListeners();
}

function resetUi() {
    document.querySelector(".book-wrapper").textContent = "";
    getBooks();
}

// GOOGLE SIGNIN AND LOGOUT
function signIn() {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result)
            const token = credential.accessToken;
            const user = result.user;
            initLoggedIn(user.displayName);
            sessionStorage.setItem("uid", user.uid);
            getBooks();
        }).catch(error => {
            console.log(error.code)
            console.log(error.message)
        })
}

function userSignOut() {
    const auth = getAuth();
    console.log("Signing out");
    signOut(auth).then(() => {})
        .catch((error) => {
            console.log(error.message);
        })
    initLoggedOut();
}


function initLoggedIn(user) {
    signInButton.style.display = "none";
    signOutButton.style.display = "inline-block";
    let userGreeting = document.createElement("p")
    userGreeting.classList.add("user-greeting");
    userGreeting.textContent = `Hi, ${user}!`
    document.querySelector(".header-button-container").prepend(userGreeting);
}

function initLoggedOut() {
    signInButton.style.display = "inline-block";
    signOutButton.style.display = "none";
    let userGreeting = document.querySelector(".user-greeting");
    userGreeting.remove();
}

let signInButton = document.querySelector(".sign-in-button");
signInButton.onclick = signIn;

let signOutButton = document.querySelector(".sign-out-button");
signOutButton.onclick = userSignOut

// OPEN CLOSE MODAL
const modal = document.querySelector(".modal");
const modalClose = document.querySelector(".modal-close");
function closeModal(){
    modal.style.display = "none";
}
function showModal(){
    modal.style.display="block";
}
modalClose.onclick = function(){
    closeModal();
};
window.onclick = function(){
    if (event.target == modal){
        closeModal();
    }
};
const addBook = document.querySelector(".add-book");
addBook.onclick = function(){
    showModal();
};

// CREATE SINGLE BOOK CARD
const bookWrapper = document.querySelector(".book-wrapper")

function newBookCard (book){
    const bookCard = document.createElement("div");
    const title = document.createElement("p");
    const author = document.createElement("p");
    const pages = document.createElement("p");
    const readDiv = document.createElement("div");
    const readText = document.createElement("div");
    const readButton = document.createElement("button");
    const removeButton = document.createElement("button");
    const bookButtonCont = document.createElement("div")

    bookCard.classList.add("book-card");
    readDiv.classList.add("read-button-cont");
    readButton.classList.add("change-button");
    removeButton.classList.add("remove-button");
    readText.classList.add("read-unread");
    bookButtonCont.classList.add("book-button-cont");

    title.textContent = `"${book.title}"`;
    author.textContent = book.author;
    pages.textContent = `${book.pages} pages`;
    readText.textContent = book.read;
    readButton.textContent = "CHANGE";
    removeButton.textContent = "REMOVE";

    bookCard.appendChild(title);
    bookCard.appendChild(author);
    bookCard.appendChild(pages);
    readDiv.appendChild(readText);
    readDiv.appendChild(readButton);
    bookButtonCont.appendChild(readDiv);
    bookButtonCont.appendChild(removeButton);
    bookCard.appendChild(bookButtonCont);

    bookWrapper.appendChild(bookCard);
};

function addCardListeners() {
    const removeButtons = document.querySelectorAll(".remove-button")

    removeButtons.forEach(button =>{
        button.addEventListener("click", (e) => {
            let title = e.target.parentElement.parentElement.firstChild.textContent.split("")
            let cleanedTitle = title.slice(1, -1).join("");
            let author = e.target.parentElement.parentElement.firstChild.nextSibling.textContent;
            let docName = cleanedTitle + author;
            deleteBook(docName);
        });
    });
    const readButtons = document.querySelectorAll(".change-button")

    readButtons.forEach(button =>{
        button.addEventListener("click", (e) =>{
            let readStatus = e.target.parentElement.firstChild.textContent;
            let title = e.target.parentElement.parentElement.parentElement.firstChild.textContent.split("")
            let cleanedTitle = title.slice(1, -1).join("");
            let author = e.target.parentElement.parentElement.parentElement.firstChild.nextSibling.textContent;
            let docName = cleanedTitle + author;
            changeRead(docName, readStatus);
        })
    })
}




// MODAL FORM TO BOOK OBJECT
function addBookForm(){
    const noErrors = validateForm();
    if(noErrors){
        formToBook();
        closeModal();
    }
};

const modalSubmitButton = document.querySelector("#modalSubmit");
modalSubmitButton.onclick = function(){
    addBookForm();
};

function formToBook(){
    const title = document.querySelector("#title").value;
    const author = document.querySelector("#author").value;
    const pages = document.querySelector("#pages").value;
    const read = document.querySelector('input[name="read"]:checked').value;

    const bookToAdd = {title, author, pages, read}
    setBook(bookToAdd);
    resetUi();
    const form = document.querySelector("form");
    form.reset();
};

// FORM VALIDATION
function validateForm(){
    const title = document.querySelector("#title").value;
    const author = document.querySelector("#author").value;
    const pages = document.querySelector("#pages").value;
    const errorMessages = document.querySelectorAll(".error-message");
    if(title == "" || author == "" || pages <= 0 || pages.match(/[^0-9]/)){
        errorMessages.forEach(message => message.classList.add("active"));
        return false;
    } else{
        errorMessages.forEach(message => message.classList.remove("active"));
        return true;
    }
}



