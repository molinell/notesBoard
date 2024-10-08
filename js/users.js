const API_URL = "http://localhost:8088";

//Knapparna är här nu då de ej funkar om satta in i main.js
document.querySelector('#button-login').addEventListener('click', () =>{
    const user = document.querySelector('#username').value;
    const pass = document.querySelector('#password').value;
    logIn(user, pass);
});

document.querySelector('#button-register').addEventListener('click', () =>{
    const username = document.querySelector('#username-reg').value;
    const password = document.querySelector('#password-reg').value;
    const email = document.querySelector('#email-reg').value;
    registerUser(username, password, email);
});

async function registerUser(username, password, email){
   const role = "user"
   // token skapas endast vid inloggning! Så, registrera först, sedan
   // logga in för att nå till sin profil
    try {
        // Hur göra med role, user? 
        const resp = await fetch(`${API_URL}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "name": username,
                "email": email,
                "role": role,
                "password": password
            })
        })
        console.log("New user created!")

        
    } catch (error) {
        console.error("Error occurred during registration:", error);
    }
}


async function logIn(user, pass){
    console.log("you are " + user + " with a pass: " + pass)
    // POST username and password 
    try {
        const resp = await fetch(`${API_URL}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "email": user,
                "password": pass
            })
        })
        
        const respData = await resp.json();
        const token = respData.jwt
        // Save to local storage 
        localStorage.setItem('token', token);
        
        if (token) {
            const token = respData.jwt;
            console.log("Login successful, token:", token);
            fetchBoards(token);
            //respData.redirect('/users/profile')

        } else {
            console.log("Login failed:", respData.msg);
        }
    } catch (error) {
        console.error("Error occurred during login:", error);
    }
}

async function fetchBoards(token) {
    const boardsResp = await fetch(`${API_URL}/boards`, { 
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    const boardsData = await boardsResp.json();
    console.log("Fetched boards:", boardsData);

    // Check if the response contains the notes
    if (boardsData && boardsData.boards) {
        console.log("User's boards:", boardsData.boards);
        displayBoards(boardsData.boards); // Call function to display notes
    } else {
        console.log("You have 0 boards, create one!");
        displayNoBoardsMessage()
    }
}

function displayBoards(boards) {
    const boardscontainer = document.getElementById("boards-container");
    boardscontainer.innerHTML = "";

    // Loop through each board and create HTML elements to display them
    boards.forEach(board => {
        const boardElement = document.createElement("div");
        console.log("new note")
    //behöver dynamsikt hitta hur många notes de finns

    boardscontainer.innerHTML += `
        <div>
        Board Title: ${board.title}
        </div>`

        /*
        boardElement.classList.add("board-item");
        boardElement.textContent = `Board Title: ${board.title}`; // Assuming the board has a title field

        const viewNotesButton = document.createElement("button");
        viewNotesButton.textContent = "View Notes";
        viewNotesButton.addEventListener("click", () => {
            fetchNotesForBoard(board.id); // Function to fetch notes for the selected board
        });

        boardElement.appendChild(viewNotesButton);
        boardscontainer.appendChild(boardElement);
        */
    });
}

function displayNoBoardsMessage() {
    const boardsContainer = document.getElementById("boards-container");
    boardsContainer.innerHTML = "<p>You have no boards. Create a board to get started!</p>";
}
