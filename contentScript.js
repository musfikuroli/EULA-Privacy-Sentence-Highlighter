// let jsonData = {};

// UBI Soft
let jsonData = {
  eula_severity_rating: [
    {
      overall_severity_of_the_eula: "Low",
      severity_safety_rating: "80%",
    },
  ],
  warnings: [
    {
      warning_number: 1,
      category: "Third-party Sharing",
      icon_tag: "third-party-sharing",
      severity_indicator: "red",
      description:
        "This application shares user data with third-party entities. Understand the purposes of such sharing, the entities involved, and review the privacy policy to ensure your data is handled responsibly and securely.",
    },
    {
      warning_number: 2,
      category: "Data Usage Analytics",
      icon_tag: "data-usage-analytics",
      severity_indicator: "yellow",
      description:
        "The application collects and analyzes user data for the purpose of improving its products and services. Review the privacy policy to understand the types of data collected and how it is used.",
    },
    {
      warning_number: 3,
      category: "Personal Data Access",
      icon_tag: "personal-data-access",
      severity_indicator: "red",
      description:
        "This application has the capability to access a wide range of personal data, including images, SMS messages, and other sensitive information stored on the device. Exercise caution and review the privacy settings before granting access.",
    },
    {
      warning_number: 4,
      category: "Terms of Service",
      icon_tag: "terms-of-service",
      severity_indicator: "green",
      description:
        "By installing or using the Product, you agree to abide by the terms of service set forth by the developer. Review the terms of service to understand your rights and responsibilities while using the application.",
    },
  ],
};

//#####---Function to Extract All Text Content from The Page---#####--------------------------------------------------------------------

function extractAllText() {
  const allText = [];

  // Function to check if an element is visible to the user
  function isVisible(element) {
    const style = getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  // Traverse all text nodes in the DOM tree and collect their visible text content
  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      // Check if the parent element is visible
      if (node.parentElement && isVisible(node.parentElement)) {
        allText.push(node.textContent);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE && isVisible(node)) {
      // If it's not a text node, recursively traverse its child nodes
      for (const childNode of node.childNodes) {
        traverse(childNode);
      }
    }
  }

  // Start traversal from the <body> element
  traverse(document.body);

  // Combine all collected visible text into a single string
  return allText.join(" ");
}
//---------------------------------------------------Ending---of---Function---------------------------------------------------------------------------
//
//
//
//
//#####---Function to Fetch and Parse The Privacy Sensitive Words List File [Hard-Coded]---#####------------------------------------------------------
async function fetchWordList() {
  try {
    // Hardcoded wordlist
    const privacySensitiveWordslist = [
      "access",
      "aggregate",
      "connect",
      "consolidate",
      "disclose",
      "display",
      "maintain",
      "mare",
      "investigate",
      "post",
      "reserve",
      "review",
      "allow",
      "contact",
      "enforce",
      "maximize",
      "prevent",
      "share",
      "apply",
      "contract",
      "ensure",
      "minimize",
      "prohibit",
      "specify",
      "avoid",
      "customize",
      "exchange",
      "monitor",
      "protect",
      "store",
      "block",
      "deny",
      "help",
      "notify",
      "provide",
      "update",
      "change",
      "destroy",
      "honor",
      "obligate",
      "recommend",
      "urge",
      "choose",
      "disallow",
      "imply",
      "opt-in",
      "request",
      "use",
      "collect",
      "comply",
      "discipline",
      "disclaim",
      "inform",
      "limit",
      "opt-out",
      "require",
      "verify",
      "personal",
      "ip address",
      "third-party",
      "publish",
      "consent",
      "process",
      "create",
      "delete",
      "retention",
      "registration",
      "mobile",
      "phone",
      "speech recognition",
      "cloud",
      "service",
      "jurisdictions",
      "password",
      "protection",
      "information",
      "location",
      "real-time",
      "upload",
      "download",
      "shared",
      "first-party",
      "automatically",
      "usage",
      "trend",
      "log",
      "mapping",
      "advertising",
      "track",
      "payment",
      "chat",
      "history",
      "record",
      "anonymous",
      "biometric",
      "cookie",
      "gdpr",
      "correction",
      "child",
      "age",
      "legal",
      "erasure",
      "deletion",
      "withdraw",
      "retention period",
      "security",
      "sell",
      "monetization",
      "transfer",
      "under-age",
      "accountability",
      "agree",
      "disagree",
    ];

    return privacySensitiveWordslist
      .map((word) => word.trim())
      .filter((word) => word !== "");
  } catch (error) {
    console.error("Failed to fetch or parse the wordlist:", error);
    return [];
  }
}
//---------------------------------------------------Ending---of---Function----------------------------------------------------------------------------
//
//
//
//#####---Function to send a message to the popup with jsonData---#####--------------------------------------------------------------------------------
function sendMessageToPopup(data) {
  // console.log("Sending data to popup:", data);
  chrome.runtime.sendMessage({ message: "show_data", data: data });
}
//---------------------------------------------------Ending---of---Function----------------------------------------------------------------------------
//
//
//
// Define a callback function to be called when highlighting is complete
function highlightingCallback() {
  // Send a message to the popup after highlighting is complete
  // setTimeout(function () {
  //   sendMessageToPopup(jsonData);
  // }, 15000);
  sendMessageToPopup(jsonData);
}
//
//
//
//
import nlp from "compromise"; // Importing The "Compromise NLP Library"

//#####---Function for Highlighting The Privacy Sensitive Sentences---#####---------------------------------------------------------------
async function highlightSentencesWithPrivacyWords() {
  const predefinedWords = await fetchWordList();
  const allPageText = extractAllText();

  const sentences = nlp(allPageText).sentences().out("array");
  const elements = document.querySelectorAll("body *");

  sentences.forEach((sentence) => {
    // console.log(sentence);
    for (const currentWord of predefinedWords) {
      if (nlp(sentence).match(currentWord).found) {
        console.log(sentence);
        // Highlight the sentence by iterating through elements
        elements.forEach((element) => {
          const node = element.firstChild;
          if (node !== null && node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue;
            if (text.includes(sentence)) {
              const newNode = document.createElement("span");
              newNode.innerHTML = text.replace(
                sentence,
                `<span style="background-color: yellow">${sentence}</span>`
              );
              element.replaceChild(newNode, node);
            }
          }
        });

        break; // Break out of the inner loop once a match is found in the sentence.
      }
    }
  });
}

// import nlp from "compromise"; // Importing The "Compromise NLP Library"
// // import mark from "mark.js"; // Import mark.js

// // import nlp from "compromise";
// import Mark from "mark.js";

// async function highlightSentencesWithPrivacyWords() {
//   const predefinedWords = await fetchWordList();
//   const allPageText = extractAllText();

//   const sentences = nlp(allPageText).sentences().out("array");
//   const elements = document.querySelectorAll("body *");

//   const markInstance = new Mark(elements);

//   sentences.forEach((sentence) => {
//     for (const currentWord of predefinedWords) {
//       const escapedWord = currentWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//       const regex = new RegExp(escapedWord, "i");

//       if (nlp(sentence).match(currentWord).found) {
//         markInstance.markRegExp(regex, { className: "highlighted-sentence" });
//         break;
//       }
//     }
//   });

//   // // Optional: Customize highlighting style
//   // markInstance
//   //   .set({
//   //     element: "mark", // Use <mark> tags for highlighting
//   //     class: "highlighted", // Apply a custom CSS class
//   //     className: "highlight-custom", // Alternative way to set a class
//   //     exclude: ["no-highlight"], // Exclude elements with this class
//   //     accuracy: "exactly", // Match whole words only
//   //     separateWordSearch: false, // Highlight whole sentences containing the word
//   //     iframes: true, // Include text within iframes
//   //     // ...other options as needed
//   //   })
//   //   .markDone(); // Trigger highlighting
// }

// import nlp from "compromise";

// async function highlightSentencesWithPrivacyWords() {
//   const predefinedWords = await fetchWordList();
//   const allPageText = extractAllText();

//   const sentences = nlp(allPageText).sentences().out("array");
//   const elements = document.querySelectorAll("body *");

//   sentences.forEach((sentence) => {
//     for (const currentWord of predefinedWords) {
//       const escapedWord = currentWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//       const regex = new RegExp(`(${escapedWord})`, "ig");

//       if (nlp(sentence).match(currentWord).found) {
//         elements.forEach((element) => {
//           if (
//             element.childNodes.length === 1 &&
//             element.childNodes[0].nodeType === Node.TEXT_NODE
//           ) {
//             const text = element.childNodes[0].nodeValue;
//             if (text.match(regex)) {
//               const newNode = document.createElement("span");
//               newNode.innerHTML = text.replace(
//                 regex,
//                 '<span style="background-color: yellow;">$1</span>'
//               );
//               element.replaceChild(newNode, element.childNodes[0]);
//             }
//           }
//         });

//         break;
//       }
//     }
//   });
// }

// Message listener to trigger highlighting sentences and send jsonData when a message is received
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "highlight_words") {
    highlightSentencesWithPrivacyWords().then(highlightingCallback);
    return true;
  }
});
