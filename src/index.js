import { parse } from "node-html-parser";
import axios from "axios";
import $ from "jquery";
import "datatables.net-dt";

const base = "https://edwardmellor.co.uk";
const api = `${base}/auctions/`;

/** 
 * Logs a message with a timestamp.
 * @param {string} message - The message to log.
 */
export const logMessage = (message) => {
  const logList = document.querySelector("#log-list");
  const timestamp = new Date().toLocaleTimeString();
  const logItem = document.createElement("li");
  logItem.textContent = `[${timestamp}] ${message}`;
  logList.appendChild(logItem);
};

/**
 * Extracts text from an element using a CSS selector.
 * @param {HTMLElement} element - The parent element.
 * @param {string} selector - The CSS selector for the target element.
 * @returns {string} The extracted text, or an empty string if not found.
 */
export const extractText = (element, selector) => {
  const target = element?.querySelector(selector)?.parentNode?.lastChild;
  return target ? target.text.trim() : "";
};

/**
 * Extracts price data from a div element.
 * @param {string} priceDiv - The HTML string of the price div.
 * @returns {string} The extracted price text, or an empty string if not found.
 */
export const extractPriceData = (priceDiv) => {
  const pricing = priceDiv ? parse(priceDiv) : null;
  const price = pricing?.lastChild?.lastChild;
  return price ? price.text.trim() : "";
};

/**
 * Extracts status data from a div element.
 * @param {HTMLElement} statusDiv - The status div element.
 * @returns {string} The extracted status text, or an empty string if not found.
 */
export const extractStatusData = (statusDiv) => {
  const status = statusDiv?.firstChild;
  return status ? status.text.trim() : "";
};

/**
 * Creates a table row for an auction item.
 * @param {number} index - The index of the row.
 * @param {string} link - The URL of the item.
 * @param {string} address - The address of the item.
 * @param {string} beds - Number of beds.
 * @param {string} baths - Number of baths.
 * @param {string} receptions - Number of receptions.
 * @param {string} price - The item's price.
 * @param {string} status - The item's status.
 * @returns {HTMLElement} The constructed table row element.
 */
export const createTableRow = (index, link, address, beds, baths, receptions, price, status) => {
  const newRow = document.createElement("tr");
  [
    index,
    `<a href="${base + link}" target="_blank">${address}</a>`,
    beds,
    baths,
    receptions,
    price,
    status,
  ].forEach((data) => {
    const cell = document.createElement("td");
    cell.innerHTML = data;
    newRow.appendChild(cell);
  });
  logMessage(`Adding entry for ${address}`);
  return newRow;
};

/**
 * Creates a DataTable with the provided auction items.
 * @param {HTMLElement[]} items - List of auction item HTML elements.
 */
export const createTable = async (items) => {
  const table = $("#auctionTable").DataTable();
  table.destroy();

  const start = performance.now();
  const tableBody = document.getElementById("rows");
  tableBody.innerHTML = ""; // Clear existing rows

  const tableRows = items.map((item, i) => {
    const parsedItem = parse(item);
    const itemDiv = parsedItem.querySelector(".col-9.col-md-5");
    const priceDiv = parsedItem.querySelector(".mt-2.mt-md-0.col-6.col-md-2");
    const statusDiv = parsedItem.querySelector(".mt-2.mt-md-0.col-6.col-md-2.align-items-center");

    const details = parse(itemDiv);
    const beds = extractText(details, ".lead.icon-beds.align-middle");
    const receptions = extractText(details, ".lead.icon-receptions.align-middle");
    const baths = extractText(details, ".lead.icon-baths.align-middle");
    const price = extractPriceData(priceDiv);
    const status = extractStatusData(statusDiv);

    const link = itemDiv?.firstChild?.rawAttributes.href;
    const address = itemDiv?.firstChild?.text.trim();
    return createTableRow(i + 1, link, address, beds, baths, receptions, price, status);
  });

  tableRows.forEach((row) => tableBody.appendChild(row));
  $("#auctionTable").DataTable();

  const end = performance.now();
  logMessage(`Table created in ${(end - start).toFixed(2)} ms`);
};

/**
 * Fetches and processes content for a specific auction date.
 * @param {string} url - The URL to fetch.
 */
export const getContentForDate = async (url) => {
  try {
    logMessage(`Fetching content from: ${url}`);
    const start = performance.now();

    const auctionResp = await axios.get(url);
    const auctionsPage = parse(auctionResp.data);
    const items = auctionsPage.querySelectorAll(".row.py-2");

    await createTable(items);

    const end = performance.now();
    logMessage(`Content fetched and processed in ${(end - start).toFixed(2)} ms`);
  } catch (error) {
    logMessage(`Error fetching content for date: ${error.message}`);
  }
};

/**
 * Fetches the main auction content and initializes the table.
 */
export const getContent = async () => {
  const loading = document.querySelector(".loading");
  const results = document.querySelector(".result-container");
  const errors = document.querySelector(".errors");
  const dateElement = document.getElementById("date");

  loading.style.display = "block";
  errors.textContent = "";

  try {
    logMessage("Starting main content fetch...");
    const start = performance.now();

    const response = await axios.get(`${api}/`);
    const dom = parse(response.data);

    const items = dom.querySelectorAll(".d-flex.rIcHy .pw-bl");
    if (!items.length) throw new Error("No auction buttons found");

    const firstItem = items[0];
    const url = firstItem.href || firstItem.getAttribute("href");
    if (!url) throw new Error("No URL found in the first button");

    dateElement.textContent = url; // Display date
    await getContentForDate(url);

    const end = performance.now();
    logMessage(`Main content fetch completed in ${(end - start).toFixed(2)} ms`);
    results.style.display = "block";
  } catch (error) {
    errors.textContent = `Error: ${error.message}`;
    logMessage(`Error: ${error.message}`);
  } finally {
    loading.style.display = "none";
  }
};

/**
 * Initializes the scraper by fetching the main content on page load.
 */
document.addEventListener("DOMContentLoaded", () => {
    logMessage("Initializing scraper...");
    getContent();
});

// Export for testing
export default {
  logMessage,
  extractText,
  extractPriceData,
  extractStatusData,
  createTableRow,
  createTable,
  getContentForDate,
  getContent
};
