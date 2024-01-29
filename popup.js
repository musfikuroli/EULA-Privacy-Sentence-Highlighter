// Function to update the popup with received jsonData
async function updatePopupWithData(jsonData) {
  // Define dataContainer
  const dataContainer = document.getElementById("data-container");
  const loadingBar = document.querySelector(".loading-bar"); // Use querySelector for class

  // Hide the loading bar once the data is received
  loadingBar.style.display = "none";

  // Display EULA Severity Rating
  const eulaSeverityRating = jsonData.eula_severity_rating[0];
  displayEulaSeverityRating(eulaSeverityRating);

  // Display Warnings
  for (const warning of jsonData.warnings) {
    // Create a bold element for the Warning Category
    const categoryElement = document.createElement("b");
    categoryElement.textContent = warning.category;

    // Use chrome.runtime.getURL to get the fully qualified URL for the icon
    const iconPath = `icons/${warning.icon_tag}.png`;
    const iconUrl = chrome.runtime.getURL(iconPath);

    try {
      // The image file exists, create a container div for the category icon and severity rating indicator color
      const iconContainer = document.createElement("div");
      iconContainer.className = "icon-container";

      // Check if the image file exists
      await fetch(iconUrl);

      // The image file exists, create an img element for the icon
      const iconElement = document.createElement("img");
      iconElement.src = iconUrl;
      iconElement.alt = `${warning.icon_tag} icon`;
      iconElement.className = "icon";

      // Create a div for holding the severity indicator color
      const severityIndicator = document.createElement("div");
      severityIndicator.className = "severity-indicator";
      severityIndicator.style.backgroundColor = warning.severity_indicator;

      // Append the icon and severity indicator to the icon container
      iconContainer.appendChild(iconElement);
      iconContainer.appendChild(severityIndicator);

      // Create a paragraph element for the Warning Description
      const descriptionElement = document.createElement("p");
      descriptionElement.textContent = warning.description;

      // Append the icon container, category, and description to the data container
      dataContainer.appendChild(iconContainer);
      dataContainer.appendChild(categoryElement);
      dataContainer.appendChild(descriptionElement);
    } catch (error) {
      // Check if the error is due to the file not being found
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        // The image file exists, create a container div for the category icon and severity rating indicator color
        const defaultIconContainer = document.createElement("div");
        defaultIconContainer.className = "icon-container";

        // If the file is not found, use a default icon
        const defaultIconUrl = chrome.runtime.getURL("icons/default.png");
        // Create an img element for the default icon
        const defaultIconElement = document.createElement("img");
        defaultIconElement.src = defaultIconUrl;
        defaultIconElement.alt = "Default icon";
        defaultIconElement.className = "icon";

        // Create a div for holding the severity indicator color
        const defaultSeverityIndicator = document.createElement("div");
        defaultSeverityIndicator.className = "severity-indicator";
        defaultSeverityIndicator.style.backgroundColor =
          warning.severity_indicator;

        // Append the icon and severity indicator to the icon container
        defaultIconContainer.appendChild(defaultIconElement);
        defaultIconContainer.appendChild(defaultSeverityIndicator);

        // Create a paragraph element for the Warning Description
        const descriptionElement = document.createElement("p");
        descriptionElement.textContent = warning.description;

        // Append the default icon and text to the data container
        dataContainer.appendChild(defaultIconContainer);
        dataContainer.appendChild(categoryElement);
        dataContainer.appendChild(descriptionElement);
      } else {
        // Handle other fetch errors
        console.error(`Error checking for ${iconPath}:`, error);
      }
    }
  }
}

function displayEulaSeverityRating(eulaSeverityRating) {
  const dataContainer = document.getElementById("data-container");

  // Create a container div for the EULA Severity Rating
  const eulaRatingContainer = document.createElement("div");
  eulaRatingContainer.className = "eula-rating-container";

  // // Create elements for overall severity and safety rating
  // const overallSeverityElement = document.createElement("p");
  // overallSeverityElement.innerHTML = `<b>Overall Severity:</b> ${eulaSeverityRating.overall_severity_of_the_eula}`;

  // Create elements for overall severity and safety rating
  const overallSeverityElement = document.createElement("p");
  const overallSeverityValue = eulaSeverityRating.overall_severity_of_the_eula;

  let overallSeverityColor = ""; // Default color

  // Set color based on severity value
  if (overallSeverityValue === "High") {
    overallSeverityColor = "red";
  } else if (overallSeverityValue === "Medium") {
    overallSeverityColor = "#ebc934";
  } else if (overallSeverityValue === "Low") {
    overallSeverityColor = "green";
  }

  // Set the inner HTML with the colored value and class for span
  overallSeverityElement.innerHTML = `<b>Severity:</b> <span class="severity-value" style="color: ${overallSeverityColor};">${overallSeverityValue}</span>`;

  // Set The EULA Safety Rating. Example: 80%
  const safetyRatingElement = document.createElement("p");
  safetyRatingElement.innerHTML = `<b>Safety Rating:</b> ${eulaSeverityRating.severity_safety_rating}`;

  // Append elements to the eula rating container
  eulaRatingContainer.appendChild(overallSeverityElement);
  eulaRatingContainer.appendChild(safetyRatingElement);

  // Append the eula rating container to the data container
  dataContainer.appendChild(eulaRatingContainer);
}

// Message listener to handle the received data
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "show_data") {
    console.log("Sending data to popup:", request.data);
    updatePopupWithData(request.data);
    return true;
  }
});

// Function to send a message to the content script to highlight words
function sendMessageToContentScript() {
  const loadingBar = document.querySelector(".loading-bar"); // Use querySelector for class
  const button = document.querySelector(".button");

  // Hide the button if Clicked
  button.style.display = "none";

  // Show the loading bar when the button is clicked
  loadingBar.style.display = "block";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { message: "highlight_words" });
  });
}

// Event listener for the button click in the popup
document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector(".button");
  button.addEventListener("click", () => {
    sendMessageToContentScript();
  });

  // Set the initial state of the loading bar to be hidden
  const loadingBar = document.querySelector(".loading-bar");
  loadingBar.style.display = "none";
});
