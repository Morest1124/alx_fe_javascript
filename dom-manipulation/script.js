// Simple list of quotes (each quote has text and a category)
let quotes = [
  { text: "Stay hungry, stay foolish.", category: "Inspiration" },
  {
    text: "The best way to predict the future is to invent it.",
    category: "Tech",
  },
  {
    text: "Debugging is like being the detective in a crime movie where you are also the murderer.",
    category: "Humor",
  },
];

// References to HTML elements
let quoteDisplay = document.getElementById("quoteDisplay");
let newQuoteBtn = document.getElementById("newQuote");


// Form elements
let newQuoteText = document.getElementById("newQuoteText");
let newQuoteCategory = document.getElementById("newQuoteCategory");
if (newQuoteBtn == true) {
  newQuoteBtn.addEventListener("click", "newQuoteText");
}
// Function to show a random quote
function showRandomQuote() {
  let randomIndex = Math.floor(Math.random() * quotes.length);
  let quote = quotes[randomIndex];

  // Display the quote in the div
  quoteDisplay.innerHTML = `
    <blockquote>
      <p>${quote.text}</p>
      <footer>Category: ${quote.category}</footer>
    </blockquote>
  `;
}

function createAddQuoteForm() {
  let text = newQuoteText.value.trim();
  let category = newQuoteCategory.value.trim();

  // Simple validation
  if (text === "" || category === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  // Add to our quotes array
  quotes.push({ text: text, category: category });

  // Create a new blockquote element,
  let blockquote = document.createElement("blockquote");
  let p = document.createElement("p");
  p.textContent = text;
  let footer = document.createElement("footer");
  footer.textContent = `Category: ${category}`;

  blockquote.appendChild(p);
  blockquote.appendChild(footer);

  // Append the blockquote to the quoteDisplay element
  quoteDisplay.appendChild(blockquote);

  // Clear the input fields
  newQuoteText.value = "";
  newQuoteCategory.value = "";

  // Feedback
  alert("New quote added!");
}


  // Optional: show the new quote immediately
  quoteDisplay.innerHTML = `
    <blockquote>
      <p>${text}</p>
      <footer>Category: ${category}</footer>
    </blockquote>
  `;
}

// When the page first loads, show a quote
showRandomQuote();

// When user clicks the button, show a new random quote
newQuoteBtn.onclick = showRandomQuote;

// Note: The Add Quote button calls addQuote() directly (via onclick in your HTML)

