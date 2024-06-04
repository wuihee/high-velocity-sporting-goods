"use strict";

const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const multer = require("multer");
const crypto = require("crypto");
const SESSION_TOKEN_SIZE = 16;
const CONFIRMATION_CODE = 32;

const SERVER_ERROR = 500;
const CLIENT_ERROR = 400;
const DEFAULT_PORT = 8000;
const SERVER_ERROR_MSG = "Encountered an error on the server.";
const PORT = process.env.PORT || DEFAULT_PORT;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(multer().none());

/**
 * Creates a session token using random bytes.
 *
 * @returns {string} The session token.
 */
function createSession() {
  return crypto.randomBytes(SESSION_TOKEN_SIZE).toString("hex");
}

/**
 * Creates a confirmation code using random bytes.
 *
 * @returns {string} The confirmation code.
 */
function getConfirmationCode() {
  return crypto.randomBytes(CONFIRMATION_CODE).toString("hex");
}

/**
 * Establishes a connection to the SQLite database.
 *
 * @returns {Promise<sqlite.Database>} The database connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: "./data.db",
    driver: sqlite3.Database
  });
  return db;
}

/**
 * Middleware to check if the user is authenticated.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function isLoggedIn(req, res, next) {
  let sessionToken = JSON.parse(req.headers.token);
  let db;
  res.type("text");
  try {
    db = await getDBConnection();
    let user = await db.get("SELECT * FROM users WHERE sessionToken = ?", [sessionToken]);
    if (user) {
      req.session = {username: user.username, id: user.id};
    }
    next();
  } catch (error) {
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  } finally {
    await db.close();
  }
}

/**
 * Endpoint for user signup.
 *
 * @param {Object} req - The request object containing the username and password.
 * @param {Object} res - The response object.
 */
app.post("/signup", async (req, res) => {
  let {username, password, email} = req.body;
  let db = await getDBConnection();
  res.type("text");
  try {
    if (!username || !password) {
      res.status(CLIENT_ERROR).send("Missing required fields.");
    } else {
      await db.run(
        `
        INSERT INTO users (username, password, email) VALUES (?, ?, ?);
        `,
        [username, password, email]
      );
      res.send("Successfully signed up.");
    }
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") {
      res.status(CLIENT_ERROR).send("Username already exists.");
    } else {
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
    }
  } finally {
    await db.close();
  }
});

/**
 * Endpoint for user login.
 *
 * @param {Object} req - The request object containing the username and password.
 * @param {Object} res - The response object.
 */
app.post("/login", async (req, res) => {
  let {username, password} = req.body;
  let db = await getDBConnection();
  try {
    if (!username || !password) {
      res.status(CLIENT_ERROR).send("Missing required fields.");
    } else {
      let userData = await db.get("SELECT username, password, id FROM users WHERE username = ?;", [
        username
      ]);
      if (!userData) {
        res.status(CLIENT_ERROR).json({message: "User does not exist."});
      } else if (userData.password !== password) {
        res.status(CLIENT_ERROR).json({message: "Invalid password."});
      } else {
        let sessionToken = createSession();
        await db.run("UPDATE users SET sessionToken = ? WHERE username = ?", [
          sessionToken,
          username
        ]);
        res.json({token: sessionToken, message: "Successfully logged in!"});
      }
    }
  } catch (error) {
    res.status(SERVER_ERROR).json({message: SERVER_ERROR_MSG});
  } finally {
    await db.close();
  }
});

/**
 * Endpoint to get all sneaker items.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/items/sneakers", async (req, res) => {
  let db;
  try {
    db = await getDBConnection();
    const rows = await db.all("SELECT * FROM items;");
    res.json(rows);
  } catch (err) {
    res
      .status(SERVER_ERROR)
      .type("text")
      .send(SERVER_ERROR_MSG);
  } finally {
    await db.close();
  }
});

/**
 * Endpoint to get a specific sneaker item by ID.
 *
 * @param {Object} req - The request object containing the item ID.
 * @param {Object} res - The response object.
 */
app.get("/items/sneakers/:id", async (req, res) => {
  const itemId = req.params.id;
  let db;
  try {
    db = await getDBConnection();
    const item = await db.get("SELECT * FROM items WHERE id = ?", [itemId]);
    if (item) {
      res.json(item);
    } else {
      res.status(CLIENT_ERROR).json({message: "Item not found"});
    }
  } catch (err) {
    res.status(SERVER_ERROR).json({message: "Server error"});
  } finally {
    await db.close();
  }
});

/**
 * Endpoint to check if the user is logged in.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/isLoggedIn", isLoggedIn, (req, res) => {
  if (req.session) {
    res.json({isLoggedIn: true, username: req.session.username, id: req.session.id});
  } else {
    res.json({isLoggedIn: false});
  }
});

/**
 * Endpoint to process a transaction (purchase).
 *
 * @param {Object} req - The request object containing the order items.
 * @param {Object} res - The response object.
 */
app.post("/transaction", isLoggedIn, async (req, res) => {
  let confirmationCode = getConfirmationCode();
  res.type("text");
  if (req.session) {
    try {
      const db = await getDBConnection();
      const errorMsg = await validateOrderItems(db, req.body);

      if (errorMsg) {
        res.status(SERVER_ERROR).json({message: errorMsg});
      } else {
        await processOrder(db, req.body, req.session.id, confirmationCode);
        res.send({message: "Purchase successful!", confirmationCode: confirmationCode});
      }

      await db.close();
    } catch (error) {
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
    }
  }
});

/**
 * Validates the order items to ensure they exist and are in stock.
 *
 * @param {Object} db - The database connection object.
 * @param {Array} orderItems - The array of order items.
 * @returns {string|null} - Returns an error message if validation fails, otherwise null.
 */
async function validateOrderItems(db, orderItems) {
  for (let {itemId, quantity} of orderItems) {
    let item = await db.get("SELECT * FROM items WHERE id = ?", [itemId]);
    if (!item) {
      return "Item not found.";
    } else if (item.availability < quantity) {
      return "Item not in stock.";
    }
  }
  return "";
}

/**
 * Processes the order by updating item availability and inserting order records.
 *
 * @param {Object} db - The database connection object.
 * @param {Array} orderItems - The array of order items.
 * @param {string} userId - The ID of the user placing the order.
 * @param {string} confirmationCode - The confirmation code for the order.
 */
async function processOrder(db, orderItems, userId, confirmationCode) {
  for (let {itemId, quantity} of orderItems) {
    let item = await db.get("SELECT * FROM items WHERE id = ?", [itemId]);
    await db.run("UPDATE items SET availability = ? WHERE id = ?", [
      item.availability - quantity,
      itemId
    ]);
    await db.run(
      "INSERT INTO orders (user_id, item_id, quantity, confirmation) VALUES (?, ?, ?, ?)",
      [userId, itemId, quantity, confirmationCode]
    );
  }
}

/**
 * Endpoint to get the order history of the logged-in user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/orderHistory", isLoggedIn, async (req, res) => {
  let db;
  let userId = req.session.id;
  try {
    db = await getDBConnection();
    const orders = await db.all(
      `
      SELECT orders.id as id, orders.quantity, orders.confirmation,
             items.name as name, items.price as price, items.image as image
      FROM orders
      JOIN items ON orders.item_id = items.id
      WHERE orders.user_id = ?;
      `,
      [userId]
    );
    const groupedOrders = orders.reduce((acc, order) => {
      if (!acc[order.confirmation]) {
        acc[order.confirmation] = [];
      }
      acc[order.confirmation].push(order);
      return acc;
    }, {});
    res.json(groupedOrders);
  } catch (error) {
    res.status(SERVER_ERROR).json(SERVER_ERROR_MSG);
  } finally {
    await db.close();
  }
});

app.use(express.static("public"));
app.listen(PORT);
