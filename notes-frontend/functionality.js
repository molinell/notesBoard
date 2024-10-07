const API_URL = "http://localhost:8088";
//const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NmZlM2MzMTU2OWIyNDI0MWVmZDZmYTgiLCJlbWFpbCI6InZhbkhlcnBlbkBzaXRlLmNvbSIsIm5hbWUiOiJJcmlzIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3Mjc5NDI2ODksImV4cCI6MTczMDUzNDY4OX0.WM56srt_rurZme3aX6rJrsH6nTci3UgWm8l1FXyTCXA";

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
   // Boards? 
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
            // Getch notes right away as the user logs in 
            //fetchNotes(token);
            //respData.redirect('/users/profile')

        } else {
            console.log("Login failed:", respData.msg);
        }
    } catch (error) {
        console.error("Error occurred during login:", error);
    }
}

// LAGA EN CREATE NOTES

// en knapp för new note


// Function for getting the notes 
async function fetchNotes(token) {
    // Fetch the notes first 
    const notesResp = await fetch(`${API_URL}/notes`, { //samma som i test.http
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    const notesData = await notesResp.json(); 
    console.log("Fetched notes:", notesData);

    // Check if the response contains the notes
    if (notesData && notesData.notes) {
        console.log("User's notes:", notesData.notes);
        displayNotes(notesData.notes); // Call function to display notes
    } else {
        console.log("You have 0 notes, create one!");
        // HTML meddelande create a note !
    }
}

function displayNotes(notes) {
    // Display in separate divs 
    const notesContainer = document.querySelector('#notes-container');
    notesContainer.innerHTML = ''; // Clear previous notes

    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.id = `note-${note.id}`; // Unique id for each note 
        

        noteElement.innerHTML = 
        `<div id=outerwrap>
            <div id=innerwrap>
                 <div id="button-wrap">
                    <button class="color-btn" data-color="red">❤️</button>
                    <button class="color-btn" data-color="purple">💜</button>
                    <button class="color-btn" data-color="blue">💙</button>
                    <button class="del-btn">✖️</button>

                 </div>
                    <div id=box>
                        <p id=notes>${note.note}</p>
                    </div>
            </div>
         </div>`;

        noteElement.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => 
            changeNoteColor(note.id, btn.dataset.color));

        noteElement.querySelector('.del-btn').addEventListener('click', () => deleteNote(note.id))

        });

        notesContainer.appendChild(noteElement);
    });
}

function deleteNote(noteId){
    console.log("Delete note function")
}

