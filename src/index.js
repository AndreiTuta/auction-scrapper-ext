import { parse } from "node-html-parser";
import axios from "axios";

const base = "https://edwardmellor.co.uk";
const api = base + "/auctions/";
const errors = document.querySelector(".errors");
const loading = document.querySelector(".loading");
const results = document.querySelector(".result-container");
results.style.display = "none";
loading.style.display = "none";
errors.textContent = "";

const createTable = async (items) => {
  console.log(items.length);
  for (var i = 0; i < items.length; i++) {
    var item = parse(items[i]);
    // table body
    var newRow = document.createElement("tr");
    var idxCell = document.createElement("td");
    var bedsCell = document.createElement("td");
    var bathsCell = document.createElement("td");
    var receptionsCell = document.createElement("td");
    var linkCell = document.createElement("td");
    var priceCell = document.createElement("td");
    var statusCell = document.createElement("td");
    //
    var itemDiv = item.querySelector(".col-9.col-md-5");
    var priceDiv = item.querySelector(".mt-2.mt-md-0.col-6.col-md-2");
    var statusDiv = item.querySelector(
      ".mt-2.mt-md-0.col-6.col-md-2.align-items-center"
    );
    var link = itemDiv.firstChild;
    var details = parse(itemDiv);
    var pricing = parse(priceDiv);
    var bedsDiv = details.querySelector(".lead.icon-beds.align-middle");
    var receptionsDiv = details.querySelector(
      ".lead.icon-receptions.align-middle"
    );
    var bathDiv = details.querySelector(".lead.icon-baths.align-middle");
    if (bedsDiv) {
      var beds = bedsDiv.parentNode;
      // console.log("BED:"  + beds.lastChild.text)
      var bedsChild = beds.lastChild;
      if (bedsChild) {
        bedsCell.innerText = bedsChild.text;
      }
    }
    if (receptionsDiv) {
      var receptions = receptionsDiv.parentNode;
      // console.log("BED:"  + beds.lastChild.text)
      var receptionsChild = receptions.lastChild;
      if (receptionsChild) {
        receptionsCell.innerText = receptionsChild.text;
      }
    }
    if (bathDiv) {
      var baths = bathDiv.parentNode;
      // console.log("BATHS: "+baths.lastChild.text)
      var bathsChild = baths.lastChild;
      if (bathsChild) {
        bathsCell.innerText = bathsChild.text;
      }
    }
    if (priceDiv) {
      var price = pricing.lastChild;
      // console.log("PRICE" + price.text)
      var priceChild = price.lastChild;
      if (priceChild) {
        priceCell.innerText = priceChild.text;
      }
    }
    if (statusDiv) {
      var status = statusDiv.firstChild;
      statusCell.innerText = status.text;
    }
    // link + address
    var anchor = document.createElement("a");
    anchor.href = base + link.rawAttributes.href;
    anchor.text = link.text;
    // populate
    idxCell.innerHTML = i + 1;
    linkCell.append(anchor);
    newRow.append(
      idxCell,
      linkCell,
      bedsCell,
      bathsCell,
      receptionsCell,
      priceCell,
      statusCell
    );
    console.log("Adding " + i);
    document.getElementById("rows").appendChild(newRow);
  }
};

const getContentForDate = async(url) => {
  document.getElementById("date").innerHTML = url;
  console.log("Found " + url);
  // load the list of auction items
  const auctionResp = await axios.get(url);
  let auctionsPage = parse(auctionResp.data);
  let items = auctionsPage.querySelectorAll(".row.py-2");
  console.log("Found " + items.length);
  // convert to a table
  createTable(items);
}

const getContent = async () => {
  loading.style.display = "block";
  try {
    const response = await axios.get(`${api}/`);
    loading.style.display = "none";
    let resp = parse(response.data);
    // load auction page and find first button
    let item = resp.querySelectorAll(".btn.btn-primary.mt-3")[0];
    if (item) {
      const url = item.rawAttributes.href;
      getContentForDate(url)
    }
    results.style.display = "block";
  } catch (error) {
    loading.style.display = "none";
    results.style.display = "none";
    errors.textContent = "Error " + error;
  }
};

getContent();
