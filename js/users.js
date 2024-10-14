//const API_URL = "http://localhost:8088";
const API_URL = "https://notes-board.azurewebsites.net";

async function registerUser(username, password, email) {
    // token is created with login
    // All new users role is set to deafult automatically

    // RegisterUser function is based off the lecture example
    try {
        const resp = await fetch(`${API_URL}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "name": username,
                "email": email,
                "password": password
            })
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
    // src: https://www.w3schools.com/jsref/met_win_settimeout.asp
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

async function logIn(user, pass) {
    // LogIn function is based off the lecture example
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
