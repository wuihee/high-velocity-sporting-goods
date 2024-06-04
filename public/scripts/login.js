/**
 * Name: Kourosh Ghahramani
 * Name: Wuihee Yap
 * Date: Jun 3, 2024
 * Section: CSE 154 AF
 * Description: Initializes the login form by adding an event listener for form submission.
 */

"use strict";

(function() {
  window.addEventListener("load", init);

  const DELAY = 500;

  /**
   * Initialize the login form with an event handler.
   */
  function init() {
    document.getElementById("login-form").addEventListener("submit", login);
  }

  /**
   * Sends a request to the backend to login.
   *
   * @param {Event} event - Submit Event.
   */
  async function login(event) {
    event.preventDefault();
    let formData = new FormData(document.getElementById("login-form"));

    try {
      let response = await fetch("/login", {
        method: "POST",
        body: formData
      });
      let {message, token} = await response.json();
      if (!response.ok) {
        displayMessage("error", message);
      } else {
        displayMessage("success", message);
        sessionStorage.setItem("token", JSON.stringify(token));
        setTimeout(() => {
          window.location.href = "/index.html";
        }, DELAY);
      }
    } catch (error) {
      displayMessage("error", error);
    }
  }

  /**
   * Displays a message for the user to see on the webpage.
   *
   * @param {string} type - The type of message. Either "success", "warning", or "error".
   * @param {string} text - The text of the message to display.
   */
  function displayMessage(type, text) {
    let messageContainer = document.getElementById("message-container");
    messageContainer.innerHTML = "";

    let message = document.createElement("div");
    message.classList.add("message", type);
    messageContainer.appendChild(message);

    let messageText = document.createElement("span");
    messageText.textContent = text;
    message.appendChild(messageText);

    let closeButton = document.createElement("span");
    closeButton.classList.add("close");
    closeButton.textContent = "✖";
    closeButton.onclick = () => messageContainer.removeChild(message);
    message.appendChild(closeButton);
  }
})();
