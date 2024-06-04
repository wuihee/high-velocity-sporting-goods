/**
 * Name: Kourosh Ghahramani
 * Name: Wuihee Yap
 * Date: Jun 3, 2024
 * Section: CSE 154 AF
 * Description: Initializes the cart functionality once the window is loaded.
 * Sets up event listeners for the clear, confirm, and purchase buttons.
 */

"use strict";

(function() {
  window.addEventListener("load", init);

  /**
   * Initializes event listeners for buttons and updates the cart display.
   */
  function init() {
    document.getElementById("clear-btn").addEventListener("click", clearCart);
    document.getElementById("confirm-btn").addEventListener("click", confirmItems);
    document.getElementById("purchase-btn").addEventListener("click", purchaseItems);
    updateCartDisplay();
  }

  /**
   * Confirms the items in the cart by moving them to the confirmed items list.
   * Clears the cart and updates the display.
   */
  function confirmItems() {
    let cart = getCart();
    sessionStorage.setItem("confirmedItems", JSON.stringify(cart));
    sessionStorage.removeItem("cart");
    updateCartDisplay();
    displayMessage("success", "Items confirmed!");
  }

  /**
   * Purchases the confirmed items by sending a POST request for each item.
   * Logs the response message for each item purchased.
   * Catches and logs any errors that occur during the purchase process.
   */
  async function purchaseItems() {
    let {idCount, sneakers} = getConfirmedItems();
    let items = [];
    for (let sneaker of sneakers) {
      items.push({itemId: sneaker.id, quantity: idCount[sneaker.id]});
    }
    try {
      let response = await fetch("/transaction", {
        method: "POST",
        headers: {"token": sessionStorage.getItem("token"), "Content-Type": "application/json"},
        body: JSON.stringify(items)
      });
      let data = await response.json();
      displayMessage("success", data.message);
      sessionStorage.removeItem("confirmedItems");
      updateCartDisplay();
    } catch (error) {
      displayMessage("error", error);
    }
  }

  /**
   * Updates the cart and confirmed items display.
   * Calculates and displays the total cost of confirmed items.
   */
  function updateCartDisplay() {
    let cart = getCart();
    let cartContainer = document.getElementById("cart-items");
    cartContainer.innerHTML = "";
    for (let sneaker of cart.sneakers) {
      cartContainer.appendChild(displaySneaker(sneaker, cart.idCount[sneaker.id]));
    }

    let confirmedItems = getConfirmedItems();
    let confirmedContainer = document.getElementById("confirmed-items");
    let totalPrice = 0;
    confirmedContainer.innerHTML = "";
    for (let sneaker of confirmedItems.sneakers) {
      confirmedContainer.appendChild(
        displaySneaker(sneaker, confirmedItems.idCount[sneaker.id], false)
      );
      totalPrice += sneaker.price * parseInt(confirmedItems.idCount[sneaker.id]);
    }
    document.getElementById("total-cost").textContent = `$${totalPrice}`;
  }

  /**
   * Creates and returns a DOM element representing a sneaker item.
   * @param {Object} sneaker - The sneaker item to display.
   * @param {number} quantity - The quantity of the sneaker item.
   * @param {boolean} [deleteOption=true] - Whether to include a delete option for the item.
   * @returns {HTMLElement} The DOM element representing the sneaker item.
   */
  function displaySneaker(sneaker, quantity, deleteOption = true) {
    let itemContainer = document.createElement("div");
    itemContainer.classList.add("item-container");
    itemContainer.id = "container-" + sneaker.id;

    // Create and append sneaker image
    let sneakerImg = document.createElement("img");
    sneakerImg.classList.add("sneaker-img");
    sneakerImg.src = "/" + sneaker.image;
    sneakerImg.alt = "Sneaker";
    itemContainer.appendChild(sneakerImg);

    // Create information container for non-image info.
    let infoContainer = document.createElement("div");
    infoContainer.classList.add("info-container");
    itemContainer.appendChild(infoContainer);

    // Create and append sneaker name
    let sneakerName = document.createElement("h3");
    sneakerName.textContent = sneaker.name;
    infoContainer.appendChild(sneakerName);

    // Create and append sneaker price
    infoContainer.appendChild(createSneakerPrice(sneaker.price));

    // Create and append sneaker gender
    infoContainer.appendChild(createSneakerGender(sneaker.gender));

    // Create and add sneaker quantity.
    infoContainer.appendChild(createSneakerQuantity(quantity));

    // Add trash icon.
    if (deleteOption) {
      let trashIcon = document.createElement("img");
      trashIcon.classList.add("trash-icon");
      trashIcon.src = "/img/trash-icon.png";
      trashIcon.alt = "Trash Icon";
      trashIcon.addEventListener("click", () => deleteItem(sneaker));
      infoContainer.appendChild(trashIcon);
    }

    return itemContainer;
  }

  /**
   * Utility function to generate quantity object.
   *
   * @param {number} quantity - Quantity of sneaker.
   * @returns {HTMLElement} - HTML element representing quantity.
   */
  function createSneakerQuantity(quantity) {
    let sneakerQuantity = document.createElement("p");
    sneakerQuantity.classList.add("quantity");
    sneakerQuantity.textContent = "x" + quantity;
    return sneakerQuantity;
  }

  /**
   * Utility function to generate price of sneaker object.
   *
   * @param {number} price - The price of shoe, what else do you think it means???
   * @returns {HTMLElement} - Price of shoe HTML element.
   */
  function createSneakerPrice(price) {
    let sneakerPrice = document.createElement("p");
    sneakerPrice.classList.add("price");
    sneakerPrice.textContent = `$${price}`;
    return sneakerPrice;
  }

  /**
   * Utility function to create gender container.
   *
   * @param {string} gender - Gender of shoe.
   * @returns {HTMLElement} - Returns gender container object.
   */
  function createSneakerGender(gender) {
    let sneakerGender = document.createElement("p");
    sneakerGender.classList.add("gender");
    sneakerGender.textContent = `${gender}'s`;
    return sneakerGender;
  }

  /**
   * Deletes an item from the cart and updates the display.
   * @param {Object} sneaker - The sneaker item to delete.
   */
  function deleteItem(sneaker) {
    let {idCount, sneakers} = getCart();
    sneakers = sneakers.filter(item => item.id !== sneaker.id);
    idCount[sneakers.id] = 0;
    sessionStorage.setItem("cart", JSON.stringify({idCount, sneakers}));
    updateCartDisplay();
  }

  /**
   * Clears the cart and confirmed items from the session storage and updates the display.
   */
  function clearCart() {
    sessionStorage.removeItem("cart");
    sessionStorage.removeItem("confirmedItems");
    document.getElementById("cart-items").innerHTML = "";
    document.getElementById("confirmed-items").innerHTML = "";
    document.getElementById("total-cost").textContent = "$0";
  }

  /**
   * Retrieves the cart items from the session storage.
   * @returns {Object} The cart items including id count and sneakers list.
   */
  function getCart() {
    let cart = JSON.parse(sessionStorage.getItem("cart"));
    if (!cart) {
      return {idCount: {}, sneakers: []};
    }
    return cart;
  }

  /**
   * Retrieves the confirmed items from the session storage.
   * @returns {Object} The confirmed items including id count and sneakers list.
   */
  function getConfirmedItems() {
    let cart = JSON.parse(sessionStorage.getItem("confirmedItems"));
    if (!cart) {
      return {idCount: {}, sneakers: []};
    }
    return cart;
  }

  /**
   * Displays a message for the user to see on the webpage.
   *
   * @param {string} type - The type of message. Either "success" "warning" or "error".
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
