/**
 * Name: Kourosh Ghahramani
 * Name: Wuihee Yap
 * Date: Jun 3, 2024
 * Section: CSE 154 AF
 * Description: Initializes the search bar setup and updates the visibility of icons
 * based on the login status once the window is loaded.
 */

"use strict";

(function() {
  window.addEventListener("load", init);

  /**
   * Initializes the search bar and updates the visibility of icons.
   */
  function init() {
    setupSearchBar();
    updateIcons();
  }

  /**
   * Updates the visibility of the login, sign-up, cart, and user buttons
   * based on the user's login status.
   */
  async function updateIcons() {
    try {
      let status = await getLoginStatus();
      if (status.isLoggedIn) {
        id("login-btn").classList.add("hidden");
        id("sign-up-btn").classList.add("hidden");
        id("cart-btn").classList.remove("hidden");
        id("user-btn").classList.remove("hidden");
      } else {
        id("login-btn").classList.remove("hidden");
        id("sign-up-btn").classList.remove("hidden");
        id("cart-btn").classList.add("hidden");
        id("user-btn").classList.add("hidden");
      }
    } catch (error) {
      displayError("Failed to update icons. Please try again later.");
    }
  }

  /**
   * Sets up the search bar to handle 'Enter' key presses.
   * Redirects the user to the sneakers page with the search term as a query parameter.
   */
  function setupSearchBar() {
    const searchBar = id("search-bar");
    searchBar.addEventListener("keypress", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        const searchTerm = searchBar.value.trim().toLowerCase();
        window.location.href = `/pages/sneakers.html?search=${searchTerm}`;
      }
    });
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
      displayError("Failed to fetch login status. Please try again later.");
    }
  }

  /**
   * Utility function to display error.
   *
   * @param {string} message - Error message.
   */
  function displayError(message) {
    const errorDisplay = id("error-display");
    errorDisplay.textContent = message;
    errorDisplay.classList.remove("hidden");
  }

  /**
   * Returns the DOM element with the specified ID.
   * @param {string} elementId - The ID of the DOM element to retrieve.
   * @returns {HTMLElement} The DOM element with the specified ID.
   */
  function id(elementId) {
    return document.getElementById(elementId);
  }
})();
