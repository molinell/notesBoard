//const API_URL = "http://localhost:8088";
const API_URL = "https://notes-board.azurewebsites.net";

async function registerUser(username, password, email){
   const role = "user"
   // token skapas endast vid inloggning! Så, registrera först, sedan
   // logga in för att nå till sin profil
    try {
        // flera boards sedan 
        const resp = await fetch(`${API_URL}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "name": username,
                "email": email,
                "role": role,
                "password": password})
        })
    
        console.log("New user created!")
        showNotification("Registration Successful!");
    
    } catch (error) {
        console.error("Error occurred during registration:", error);
        showNotification("An error occurred. Please try again.");

    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.innerText = message; 
    notification.classList.add('show'); 

    // Automatically hide the notification after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
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
        localStorage.setItem('jwt_token', token);
        
        if (token) {
            const token = respData.jwt;
            console.log("Login successful, token:", token);
            window.location.replace("/board.html");

        } else {
            console.log("Login failed:", respData.msg);
        }
    } catch (error) {
        console.error("Error occurred during login:", error);
    }
}



export { registerUser, logIn, showNotification }
