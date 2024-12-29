import { parse } from "node-html-parser";
import axios from "axios";
import $ from "jquery";
import "datatables.net-dt";

const base = "https://edwardmellor.co.uk";
const api = base + "/auctions/";
const errors = document.querySelector(".errors");
const loading = document.querySelector(".loading");
const results = document.querySelector(".result-container");
const logList = document.querySelector("#log-list");
const dateElement = document.getElementById("date");
results.style.display = "none";
loading.style.display = "none";
errors.textContent = "";

// Logging function
const logMessage = (message) => {
  const timestamp = new Date().toLocaleTimeString();
  const logItem = document.createElement("li");
  logItem.textContent = `[${timestamp}] ${message}`;
  logList.appendChild(logItem);
};

// Extractors
const extractText = (element, selector) => {
  const target = element?.querySelector(selector)?.parentNode?.lastChild;
  return target ? target.text.trim() : "";
};

const extractPriceData = (priceDiv) => {
  const pricing = priceDiv ? parse(priceDiv) : null;
  const price = pricing?.lastChild?.lastChild;
  return price ? price.text.trim() : "";
};

const extractStatusData = (statusDiv) => {
  const status = statusDiv?.firstChild;
  return status ? status.text.trim() : "";
};

// Create table row
const createTableRow = (index, link, address, beds, baths, receptions, price, status) => {
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
  logMessage(`Adding entry for ${address}`)
  return newRow;
};

// Create table
const createTable = async (items) => {
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

// Fetch content for a specific date
const getContentForDate = async (url) => {
  try {
    logMessage(`Fetching content from: ${url}`);
    const start = performance.now();

    const auctionResp = await axios.get(url);
    const auctionsPage = parse(auctionResp.data);
    const items = auctionsPage.querySelectorAll(".row.py-2");

    createTable(items);
    const end = performance.now();
    logMessage(`Content fetched and processed in ${(end - start).toFixed(2)} ms`);
  } catch (error) {
    logMessage(`Error fetching content for date: ${error.message}`);
  }
};

// Fetch main content
const getContent = async () => {
  loading.style.display = "block";
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

document.addEventListener("DOMContentLoaded", () => {
  logMessage("Initializing scraper...");
  getContent();
});
