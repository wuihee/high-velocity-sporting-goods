/**
 * Name: Kourosh Ghahramani
 * Name: Wuihee Yap
 * Date: Jun 3, 2024
 * Section: CSE 154 AF
 * Description: Initializes the signup form by adding an event listener for form submission.
 */

"use strict";

(function() {
  window.addEventListener("load", init);

  /**
   * Initialize signup form with event listener.
   */
  function init() {
    document.getElementById("signup-form").addEventListener("submit", signup);
  }

  /**
   * Sends a request to the backend to sign up a new user.
   *
   * @param {Event} event - Submit event.
   */
  async function signup(event) {
    event.preventDefault();
    let formData = new FormData(document.getElementById("signup-form"));

    try {
      let response = await fetch("/signup", {
        method: "POST",
        body: formData
      });
      let message = await response.text();
      if (!response.ok) {
        displayMessage("error", message);
      } else {
        displayMessage("success", message);
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
