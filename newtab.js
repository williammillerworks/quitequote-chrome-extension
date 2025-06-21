
const DEBUG = true;
let currentDateOffset = 0;

async function loadQuotesDatabase() {
  try {
    const response = await fetch(chrome.runtime.getURL("public/quotes-database.json"));
    return await response.json();
  } catch (error) {
    console.error("Failed to load quotes database:", error);
    return [
      {
        id: 1,
        text: "Learn how to learn from those who disagree with you",
        source: "68 Bits of Unsolicited Advice",
        author: "Kevin Kelly",
        url: "https://www.youtube.com/watch?v=Zz70rcguxwk",
        authorUrl: "https://kk.org/"
      }
    ];
  }
}

function getDateWithOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getQuoteIndex(dayOfYear, length) {
  return dayOfYear % length;
}

function renderQuote(quote, date, index, total) {
  document.getElementById("quote").textContent = `“${quote.text}”`;
  document.getElementById("source").innerHTML =
    `from <a href="${quote.url}" target="_blank" rel="noopener noreferrer">${quote.source}</a> by ` +
    `<a href="${quote.authorUrl}" target="_blank" rel="noopener noreferrer">${quote.author}</a>`;

  document.getElementById("date").textContent = date.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });

  if (DEBUG) {
    const debugPanel = document.getElementById("debug-panel");
    debugPanel.innerHTML = `
      <div style="margin-bottom: 0.5rem;">
        <button id="prev-date">←</button>
        <button id="next-date">→</button>
      </div>
      <div><strong>Day of Year:</strong> ${getDayOfYear(date)}</div>
      <div><strong>Quote Index:</strong> ${index}</div>
      <div><strong>Quote:</strong> ${quote.text}</div>
      <div><strong>Author:</strong> ${quote.author}</div>
      <div><strong>Source:</strong> ${quote.source}</div>
      <div><strong>Total Quotes:</strong> ${total}</div>
    `;

    document.getElementById("prev-date").addEventListener("click", () => updateOffset(-1));
    document.getElementById("next-date").addEventListener("click", () => updateOffset(1));
  }
}

let quotes = [];

async function initQuote() {
  quotes = await loadQuotesDatabase();
  updateOffset(0);
}

function updateOffset(offsetDelta) {
  currentDateOffset += offsetDelta;
  const date = getDateWithOffset(currentDateOffset);
  const dayOfYear = getDayOfYear(date);
  const index = getQuoteIndex(dayOfYear, quotes.length);
  const quote = quotes[index];
  renderQuote(quote, date, index, quotes.length);
}

window.addEventListener("DOMContentLoaded", initQuote);
