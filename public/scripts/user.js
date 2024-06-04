/**
 * Name: Kourosh Ghahramani
 * Name: Wuihee Yap
 * Date: Jun 3, 2024
 * Section: CSE 154 AF
 * Initializes the user page by updating user information and order history.
 */

"use strict";

(function() {
  window.addEventListener("load", init);

  const DELAY = 500;
  const ERROR_MESSAGE = "Error fetching user information. Please try again later.";

  /**
   * Initializes the user page by updating user information and order history.
   */
  function init() {
    updateUserPage();
    document.getElementById("logout-btn").addEventListener("click", logout);
  }

  /**
   * Logs out.
   */
  function logout() {
    setTimeout(() => {
      window.location.href = "/index.html";
    }, DELAY);
    sessionStorage.clear();
  }

  /**
   * Fetches and updates the user's information on the page.
   */
  async function updateUserPage() {
    try {
      let response = await fetch("/isLoggedIn", {
        method: "GET",
        headers: {Token: sessionStorage.getItem("token")}
      });
      response = statusCheck(response);
      let data = await response.json();
      document.getElementById("username").textContent = data.username;
      updateOrderHistory();
    } catch (error) {
      displayError(ERROR_MESSAGE);
    }
  }

  /**
   * Fetches and updates the user's order history on the page.
   */
  async function updateOrderHistory() {
    try {
      let response = await fetch("/orderHistory", {
        method: "GET",
        headers: {Token: sessionStorage.getItem("token")}
      });
      response = statusCheck(response);
      let data = await response.json();

      let orderCount = 1;
      for (let [confirmation, order] of Object.entries(data)) {
        let container = document.getElementById("order-history");
        let orderHeading = document.createElement("h3");
        orderHeading.textContent = `Order #${orderCount}`;
        orderCount++;

        container.appendChild(orderHeading);
        let confirmationDisplay = document.createElement("p");
        confirmationDisplay.textContent = confirmation;
        container.appendChild(confirmationDisplay);
        for (let item of order) {
          displaySneaker(item);
        }
        let lineBreak = document.createElement("hr");
        container.appendChild(lineBreak);
      }
    } catch (error) {
      displayError(ERROR_MESSAGE);
    }
  }

  /**
   * Displays a sneaker item in the order history.
   * @param {Object} item - Object containing the sneaker item details.
   */
  function displaySneaker(item) {
    let container = document.getElementById("order-history");
    let itemContainer = document.createElement("div");
    itemContainer.classList.add("item-container");
    container.appendChild(itemContainer);

    let img = document.createElement("img");
    img.src = "/" + item.image;
    img.alt = "Sneaker";
    itemContainer.appendChild(img);

    let infoContainer = document.createElement("div");
    infoContainer.classList.add("info-container");
    itemContainer.appendChild(infoContainer);

    let sneakerName = document.createElement("h4");
    sneakerName.textContent = item.name;
    infoContainer.appendChild(sneakerName);

    let sneakerPrice = document.createElement("p");
    sneakerPrice.textContent = `$${item.price}`;
    infoContainer.appendChild(sneakerPrice);

    let sneakerGender = document.createElement("p");
    sneakerGender.textContent = `${item.gender}'s`;
    infoContainer.appendChild(sneakerGender);

    let sneakerQuantity = document.createElement("p");
    sneakerQuantity.textContent = `x${item.quantity}`;
    infoContainer.appendChild(sneakerQuantity);
  }

  /**
   * Displays an error message on the page.
   * @param {string} message - The error message to be displayed.
   */
  function displayError(message) {
    let errorContainer = document.getElementById("error-container");
    if (!errorContainer) {
      errorContainer = document.createElement("div");
      errorContainer.id = "error-container";
      document.body.prepend(errorContainer);
    }
    errorContainer.textContent = message;
    errorContainer.style.color = "red";
  }

  /**
   * Checks the status of an HTTP response and throws an error if it's not okay.
   *
   * @param {Response} res - The response object to check.
   * @returns {Response} - The same response object if the response was okay.
   * @throws {Error} - Throws an error containing the response text if the response was not okay.
   */
  function statusCheck(res) {
    if (!res.ok) {
      throw new Error(ERROR_MESSAGE);
    }
    return res;
  }
})();
