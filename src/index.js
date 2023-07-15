import { parse } from "node-html-parser";
import axios from "axios";
import $ from "jquery";
import "datatables.net-dt";

// Base URL and API endpoint
const base = "https://edwardmellor.co.uk";
const api = base + "/auctions/";

// Select DOM elements
const errors = document.querySelector(".errors");
const loading = document.querySelector(".loading");
const results = document.querySelector(".result-container");
results.style.display = "none";
loading.style.display = "none";
errors.textContent = "";

// Define div classes for query selectors
const itemDivClass = ".col-9.col-md-5";
const priceDivClass = ".mt-2.mt-md-0.col-6.col-md-2";
const statusDivClass =
  ".mt-2.mt-md-0.col-6.col-md-2.align-items-center";
const bedsDivClass = ".lead.icon-beds.align-middle";
const receptionsDivClass = ".lead.icon-receptions.align-middle";
const bathDivClass = ".lead.icon-baths.align-middle";
const buttonClass = ".btn.btn-primary.mt-3";
const rowClass = ".row.py-2";

/**
 * Extracts the beds data from the HTML element.
 * @param {HTMLElement} bedsDiv - HTML element containing beds information.
 * @returns {string} - Beds data.
 */
const extractBedsData = (bedsDiv) => {
  if (bedsDiv) {
    var beds = bedsDiv.parentNode;
    var bedsChild = beds.lastChild;
    if (bedsChild) {
      return bedsChild.text;
    }
  }
  return "";
};

/**
 * Extracts the receptions data from the HTML element.
 * @param {HTMLElement} receptionsDiv - HTML element containing receptions information.
 * @returns {string} - Receptions data.
 */
const extractReceptionsData = (receptionsDiv) => {
  if (receptionsDiv) {
    var receptions = receptionsDiv.parentNode;
    var receptionsChild = receptions.lastChild;
    if (receptionsChild) {
      return receptionsChild.text;
    }
  }
  return "";
};

/**
 * Extracts the baths data from the HTML element.
 * @param {HTMLElement} bathDiv - HTML element containing baths information.
 * @returns {string} - Baths data.
 */
const extractBathsData = (bathDiv) => {
  if (bathDiv) {
    var baths = bathDiv.parentNode;
    var bathsChild = baths.lastChild;
    if (bathsChild) {
      return bathsChild.text;
    }
  }
  return "";
};

/**
 * Extracts the price data from the HTML element.
 * @param {HTMLElement} priceDiv - HTML element containing price information.
 * @returns {string} - Price data.
 */
const extractPriceData = (priceDiv) => {
  if (priceDiv) {
    var pricing = parse(priceDiv);
    var price = pricing.lastChild;
    var priceChild = price.lastChild;
    if (priceChild) {
      return priceChild.text;
    }
  }
  return "";
};

/**
 * Extracts the status data from the HTML element.
 * @param {HTMLElement} statusDiv - HTML element containing status information.
 * @returns {string} - Status data.
 */
const extractStatusData = (statusDiv) => {
  if (statusDiv) {
    var status = statusDiv.firstChild;
    return status.text;
  }
  return "";
};

/**
 * Creates a table row with the provided data.
 * @param {number} index - Index of the row.
 * @param {string} link - Link for the auction item.
 * @param {string} beds - Beds information.
 * @param {string} baths - Baths information.
 * @param {string} receptions - Receptions information.
 * @param {string} price - Price information.
 * @param {string} status - Status information.
 * @returns {HTMLTableRowElement} - Table row element.
 */
const createTableRow = (
  index,
  link,
  address,
  beds,
  baths,
  receptions,
  price,
  status
) => {
  var newRow = document.createElement("tr");
  var idxCell = document.createElement("td");
  var bedsCell = document.createElement("td");
  var bathsCell = document.createElement("td");
  var receptionsCell = document.createElement("td");
  var linkCell = document.createElement("td");
  var priceCell = document.createElement("td");
  var statusCell = document.createElement("td");

  var anchor = document.createElement("a");
  anchor.href = base + link;
  anchor.text = address;

  idxCell.innerHTML = index;
  linkCell.append(anchor);
  bedsCell.innerText = beds;
  bathsCell.innerText = baths;
  receptionsCell.innerText = receptions;
  priceCell.innerText = price;
  statusCell.innerText = status;

  newRow.append(
    idxCell,
    linkCell,
    bedsCell,
    bathsCell,
    receptionsCell,
    priceCell,
    statusCell
  );

  return newRow;
};


/**
 * Creates a table with the provided items.
 * @param {Array} items - Array of HTML elements representing auction items.
 */
const createTable = async (items) => {
  // Destroy the existing DataTable instance, if any
  const table = $("#auctionTable").DataTable();
  table.destroy();

  const tableRows = [];

  for (var i = 0; i < items.length; i++) {
    var item = parse(items[i]);

    var itemDiv = item.querySelector(itemDivClass);
    var priceDiv = item.querySelector(priceDivClass);
    var statusDiv = item.querySelector(statusDivClass);
    var link = itemDiv.firstChild;
    var details = parse(itemDiv);
    var bedsDiv = details.querySelector(bedsDivClass);
    var receptionsDiv = details.querySelector(receptionsDivClass);
    var bathDiv = details.querySelector(bathDivClass);

    var beds = extractBedsData(bedsDiv);
    var receptions = extractReceptionsData(receptionsDiv);
    var baths = extractBathsData(bathDiv);
    var price = extractPriceData(priceDiv);
    var status = extractStatusData(statusDiv);

    var newRow = createTableRow(
      i + 1,
      link.rawAttributes.href,
      link.text,
      beds,
      baths,
      receptions,
      price,
      status
    );

    tableRows.push(newRow);
  }

  const tableBody = document.getElementById("rows");
  tableRows.forEach((row) => {
    tableBody.appendChild(row);
  });

  // Reinitialize DataTables
  $("#auctionTable").DataTable();
};

/**
 * Fetches the content for the given URL and processes it.
 * @param {string} url - URL to fetch the content from.
 */
const getContentForDate = async (url) => {
  document.getElementById("date").innerHTML = url;

  const auctionResp = await axios.get(url);
  let auctionsPage = parse(auctionResp.data);
  let items = auctionsPage.querySelectorAll(rowClass);

  createTable(items);
};

/**
 * Fetches the main content and initiates the scraping process.
 */
const getContent = async () => {
  loading.style.display = "block";
  try {
    const response = await axios.get(`${api}/`);
    loading.style.display = "none";
    let resp = parse(response.data);

    let item = resp.querySelectorAll(buttonClass)[0];
    if (item) {
      const url = item.rawAttributes.href;
      getContentForDate(url);
    }
    results.style.display = "block";
  } catch (error) {
    loading.style.display = "none";
    results.style.display = "none";
    errors.textContent = "Error " + error;
  }
};

// Add an event listener to initialize DataTables after the table is populated
document.addEventListener("DOMContentLoaded", () => {
  getContent();
});