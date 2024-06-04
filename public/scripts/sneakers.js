/**
 * Name: Kourosh Ghahramani
 * Name: Wuihee Yap
 * Date: Jun 3, 2024
 * Section: CSE 154 AF
 * Description: Initializes the sneaker grid page by fetching and displaying sneakers.
 * Sets up the filter form submission event listener.
 */

"use strict";

(function() {
  const SNEAKER_API_URL = "/items/sneakers";
  const GRID_CLASS = "grid-view";
  const LIST_CLASS = "list-view";
  const UNDER_150 = 150;
  const OVER_250 = 250;
  const PRICE_RANGE = {
    "under-150": UNDER_150,
    "150-250": [UNDER_150, OVER_250],
    "over-250": OVER_250
  };

  window.addEventListener("load", init);

  /**
   * Initializes the page by retrieving search term from URL parameters and fetching sneakers.
   * Sets up the filter form submission event listener.
   * Sets up view toggle button.
   */
  function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get("search");
    fetchSneakers(searchTerm);
    id("filter-form").addEventListener("submit", submitRequest);
    id("toggle-view").addEventListener("click", toggleView);
  }

  /**
   * Fetches sneakers from the API and filters them based on the search term.
   * Loads the filtered sneakers onto the page.
   *
   * @param {string} searchTerm - The search term to filter sneakers by name or gender.
   */
  async function fetchSneakers(searchTerm = "") {
    try {
      let response = await fetch(SNEAKER_API_URL);
      let sneakers = await response.json();
      if (searchTerm) {
        sneakers = sneakers.filter(sneaker => {
          return (
            sneaker.name.toLowerCase().includes(searchTerm) ||
            sneaker.gender.toLowerCase() === searchTerm
          );
        });
      }
      loadSneakers(sneakers);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Loads the sneakers onto the sneaker grid.
   *
   * @param {Array} sneakers - The array of sneaker objects to display.
   */
  function loadSneakers(sneakers) {
    let sneakerGrid = id("sneaker-grid");
    sneakerGrid.innerHTML = "";

    sneakers.forEach(sneaker => {
      const sneakerDiv = document.createElement("div");
      sneakerDiv.className = "sneaker-item";

      const img = document.createElement("img");
      img.src = "/" + sneaker.image;
      img.alt = sneaker.name;

      const name = document.createElement("p");
      name.textContent = sneaker.name;

      const price = document.createElement("p");
      price.textContent = `$${sneaker.price}`;

      sneakerDiv.appendChild(img);
      sneakerDiv.appendChild(name);
      sneakerDiv.appendChild(price);

      sneakerDiv.addEventListener("click", () => {
        window.location.href = `../pages/sneaker-detail.html?id=${sneaker.id}`;
      });

      sneakerGrid.appendChild(sneakerDiv);
    });
  }

  /**
   * Handles the filter form submission by filtering sneakers based on selected price and gender.
   *
   * @param {Event} evt - The submit event of the filter form.
   */
  async function submitRequest(evt) {
    evt.preventDefault();
    const price = id("price").value;
    const gender = id("gender").value;

    try {
      const response = await fetch(SNEAKER_API_URL);
      if (!response.ok) {
        handleError(new Error("Failed to fetch sneakers"));
        return;
      }
      let sneakers = await response.json();

      if (price !== "all") {
        sneakers = filterByPrice(sneakers, price);
      }

      if (gender !== "all") {
        sneakers = sneakers.filter(sneaker => sneaker.gender === gender);
      }

      loadSneakers(sneakers);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Filters sneakers based on the selected price range.
   *
   * @param {Array} sneakers - The array of sneakers to filter.
   * @param {string} price - The selected price range.
   * @returns {Array} - The filtered array of sneakers.
   */
  function filterByPrice(sneakers, price) {
    switch (price) {
      case "under-150":
        return sneakers.filter(sneaker => sneaker.price < PRICE_RANGE["under-150"]);
      case "150-250":
        return sneakers.filter(sneaker => {
          return (
            sneaker.price >= PRICE_RANGE["150-250"][0] && sneaker.price <= PRICE_RANGE["150-250"][1]
          );
        });
      case "over-250":
        return sneakers.filter(sneaker => sneaker.price > PRICE_RANGE["over-250"]);
      default:
        return sneakers;
    }
  }

  /**
   * Handles errors by displaying an error message on the page.
   *
   * @param {Error} error - The error object containing the error message.
   */
  function handleError(error) {
    id("results").textContent = `ERROR: ${error.message}`;
  }

  /**
   * Utility function to get a DOM element by ID.
   *
   * @param {string} idName - The ID of the DOM element to retrieve.
   * @returns {HTMLElement} The DOM element with the specified ID.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Toggles the view between grid and list.
   */
  function toggleView() {
    const sneakerGrid = id("sneaker-grid");
    if (sneakerGrid.classList.contains(GRID_CLASS)) {
      sneakerGrid.classList.remove(GRID_CLASS);
      sneakerGrid.classList.add(LIST_CLASS);
    } else {
      sneakerGrid.classList.remove(LIST_CLASS);
      sneakerGrid.classList.add(GRID_CLASS);
    }
  }
})();
