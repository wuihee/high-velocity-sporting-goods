/**
 * Name: Kourosh Ghahramani
 * Name: Wuihee Yap
 * Date: Jun 3, 2024
 * Section: CSE 154 AF
 * Description: Initializes the sneaker detail page by fetching and displaying the sneaker details.
 */
"use strict";

(function() {
  const START_SIZE = 7.0;
  const END_SIZE = 13.0;
  const INCREMENT = 0.5;

  window.addEventListener("load", init);

  /**
   * Initializes the page by retrieving sneaker ID from URL parameters and fetching sneaker details.
   * Displays an error message if sneaker ID is missing or fetching sneaker details fails.
   */
  async function init() {
    const params = new URLSearchParams(window.location.search);
    const sneakerId = params.get("id");

    if (sneakerId) {
      try {
        const response = await fetch(`/items/sneakers/${sneakerId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch sneaker details.");
        }
        const sneaker = await response.json();

        if (sneaker) {
          displaySneakerDetails(sneaker);
        } else {
          displayError("Sneaker not found.");
        }
      } catch (error) {
        displayError("Error loading sneaker details.");
      }
    } else {
      displayError("No sneaker specified.");
    }
  }

  /**
   * Displays the sneaker and its information on the webpage.
   *
   * @param {Object} sneaker - Contains information about the current sneaker.
   */
  function displaySneakerDetails(sneaker) {
    let sneakerContainer = id("sneaker-detail");
    let sneakerImg = document.createElement("img");
    sneakerImg.id = "sneaker-img";
    sneakerImg.src = "/" + sneaker.image;
    sneakerImg.alt = sneaker.name;
    sneakerContainer.prepend(sneakerImg);

    let infoContainer = id("sneaker-info");
    let sneakerName = document.createElement("h1");
    sneakerName.textContent = sneaker.name;
    infoContainer.appendChild(sneakerName);

    let sneakerPrice = document.createElement("p");
    sneakerPrice.textContent = `$${sneaker.price}`;
    infoContainer.appendChild(sneakerPrice);

    infoContainer.appendChild(createSneakerGender(sneaker));

    let sneakerSize = document.createElement("p");
    sneakerSize.textContent = "Select Size";
    infoContainer.appendChild(sneakerSize);

    let sizeContainer = document.createElement("div");
    sizeContainer.id = "size-container";
    for (let size = START_SIZE; size < END_SIZE; size += INCREMENT) {
      sizeContainer.appendChild(createButton(size));
    }
    infoContainer.appendChild(sizeContainer);

    let addBtn = document.createElement("button");
    addBtn.id = "add-btn";
    addBtn.textContent = "Add to Cart";
    addBtn.addEventListener("click", () => addToCart(sneaker));
    infoContainer.appendChild(addBtn);
  }

  /**
   * Utility functions to generate sneaker gender.
   *
   * @param {Object} sneaker - Sneaker information.
   * @returns {HTMLElement} - Returns HTML element for sneaker gender.
   */
  function createSneakerGender(sneaker) {
    let sneakerGender = document.createElement("p");
    sneakerGender.textContent = `${sneaker.gender}'s`;
    return sneakerGender;
  }

  /**
   * Utility function to create button for shoe sizes.
   *
   * @param {number} size - Size of shoe button.
   * @returns {HTMLElement} - Button element to add.
   */
  function createButton(size) {
    let sizeButton = document.createElement("button");
    sizeButton.classList.add("size-btn");
    sizeButton.textContent = "US " + size;
    sizeButton.addEventListener("click", () => {
      document.querySelectorAll(".size-btn").forEach(btn => btn.classList.remove("selected"));
      sizeButton.classList.add("selected");
    });
    return sizeButton;
  }

  /**
   * Adds the sneaker to the cart if the user is logged in, otherwise displays a warning message.
   *
   * @param {Object} sneaker - The sneaker to add to the cart.
   */
  async function addToCart(sneaker) {
    try {
      let {isLoggedIn} = await getLoginStatus();
      if (isLoggedIn) {
        let {idCount, sneakers} = getCart();
        if (idCount[sneaker.id] || idCount[sneaker.id] === 0) {
          idCount[sneaker.id]++;
        } else {
          idCount[sneaker.id] = 1;
          sneakers.push(sneaker);
        }
        sessionStorage.setItem("cart", JSON.stringify({idCount, sneakers}));
        displayMessage("success", "Item added to cart!");
      } else {
        displayMessage("warning", "Please login before adding to cart.");
      }
    } catch (error) {
      displayMessage("error", error);
    }
  }

  /**
   * Fetches the login status of the user.
   * @returns {Object} An object containing the login status.
   */
  async function getLoginStatus() {
    try {
      let response = await fetch("/isLoggedIn", {
        method: "GET",
        headers: {Token: sessionStorage.getItem("token")}
      });
      let data = await response.json();
      return data;
    } catch (error) {
      displayMessage("error", error);
    }
  }

  /**
   * Retrieves the cart from session storage.
   * @returns {Object} The cart object containing idCount and sneakers array.
   */
  function getCart() {
    let cart = JSON.parse(sessionStorage.getItem("cart"));
    if (!cart) {
      return {idCount: {}, sneakers: []};
    }
    return cart;
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

  /**
   * Displays an error message in the sneaker detail section.
   *
   * @param {string} message - The error message to display.
   */
  function displayError(message) {
    const sneakerDetail = id("sneaker-detail");
    sneakerDetail.textContent = message;
  }

  /**
   * Utility method to retrieve a DOM element with the specified ID.
   *
   * @param {string} idName - The ID of the element to retrieve.
   * @returns {HTMLElement} The DOM element with the specified ID.
   */
  function id(idName) {
    return document.getElementById(idName);
  }
})();
