exports.yourCloudFunction = async (req, res) => {
  require("dotenv").config(); // Ensure your environment variables are loaded
  const OpenAI = require("openai");
  const nlp = require("compromise");
  const fs = require("fs").promises;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Set CORS headers for all responses
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, FETCH, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  async function fetchWordList() {
    try {
      // Read words from file
      const fileContent = await fs.readFile(
        "privacySensitiveWordslist.txt",
        "utf-8"
      );
      const privacySensitiveWordslist = fileContent
        .split("\n")
        .map((word) => word.trim())
        .filter((word) => word !== "");

      return privacySensitiveWordslist;
    } catch (error) {
      console.error("Failed to fetch or parse the wordlist:", error);
      return [];
    }
  }

  function extractSentencesWithPrivacyWords(allPageText, predefinedWords) {
    const sentences = nlp(allPageText).sentences().out("array");
    const uniquePrivacySentences = new Set();

    for (const sentence of sentences) {
      for (const currentWord of predefinedWords) {
        if (nlp(sentence).match(currentWord).found) {
          // Add the sentence to the Set to ensure uniqueness.
          uniquePrivacySentences.add(sentence);
          break; // Break out of the inner loop once a match is found in the sentence.
        }
      }
    }

    // Convert the Set to an array and join into a single paragraph.
    const paragraph = Array.from(uniquePrivacySentences).join("\n\n");

    // console.log(paragraph);

    return paragraph;
  }

  try {
    // Assuming the user's message is sent in the request body as 'userMessage'
    const userMessage = await req.body;

    // console.log("When Received: " + userMessage);

    const predefinedWords = await fetchWordList();

    const extractedSentences = await extractSentencesWithPrivacyWords(
      userMessage,
      predefinedWords
    );

    // console.log("After Extractaion: " + extractedSentences);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "system",
          content:
            'You are a Chrome Extension that generates privacy warnings by analyzing an End User License Agreement (EULA). The warnings are categorized, and each category is associated with a related icon for better visualization. The API response will include warning numbers, warning categories, icon tags, and descriptions. You will make the warning category/title on your own by analyzing the EULA and select the closest matching icon tag from the given list. \n\nThe icon tags must be selected from the following list:\n["access-control", "access-logs", "advertisement", "app-permissions", "authentication-information", "behavioral-advertising", "behavioral-analytics", "behavioral-profiling", "biometric-data", "chat-monitoring", "children-privacy", "communication-monitoring", "cookie-tracking", "data-brokerage", "data-collection", "data-retention", "data-sharing", "data-usage-analytics", "device-access-permissions", "device-heath-data", "device-identification", "device-tracking", "file-access", "financial-information", "geolocation", "health-information", "identity-theft", "incognito-mode-tracking", "information-exchange", "legal-implications", "liability", "location-history", "location-tracking", "metadata-collection", "network-access", "online-tracking", "ownership", "payment-information", "permissions", "permission-abuse", "personal-data-access", "privacy-security-concerns", "privacy", "social-connectivity", "social-media-networking", "social-media", "subscription-information", "surveillance-cameras", "surveillance", "terms-of-service", "third-party-services", "third-party-sharing", "user-account-information", "user-tracking", "voice-command-recording", "voice-recording", "website-cookies", "website-data"]\n\nA sample response structure in JSON format is given below:\n\n{\n  "warnings": [\n    {\n      "warning_number": 1,\n      "category": "Location",\n      "icon_tag": "location-tracking",\n      "description": "This application tracks the geographical location of users in order to provide location-based services. It may collect data such as GPS coordinates, Wi-Fi access points, and cell tower information."\n    },\n    {\n      "warning_number": 2,\n      "category": "Personal Data Access",\n      "icon_tag": "personal-data-access",\n      "description": "This application has the capability to access a wide range of personal data, including images, SMS messages, and other sensitive information stored on the device. Exercise caution and review the privacy settings before granting access."\n    },\n    {\n      "warning_number": 3,\n      "category": "Data Retention",\n      "icon_tag": "data-retention",\n      "description": "The application retains user data for a specified period, even after the immediate processing or use. Be aware of the data retention policies and consider whether you are comfortable with the duration your data is stored."\n    },\n    {\n      "warning_number": 4,\n      "category": "Third-party Sharing",\n      "icon_tag": "third-party-sharing",\n      "description": "This application shares user data with third-party entities. Understand the purposes of such sharing, the entities involved, and review the privacy policy to ensure your data is handled responsibly and securely."\n    }\n  ]\n}\n\nNever reply anything beside this format. In every incoming message, user will send you a EULA and you will just reply in the above format by analyzing the EULA.\n\n\n',
        },
        {
          role: "user",
          content: extractedSentences,
        },
      ],
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Extracting generated warnings from the response
    // const generatedWarnings = response.choices.map(
    //   (choice) => choice.message.content
    // );

    // console.log(response.choices[0].message.content);
    res.status(200).send(response.choices[0].message.content);

    // res.status(200).send(extractedSentences);
  } catch (error) {
    res.status(500).send("Error generating warnings: " + error); // Set an appropriate HTTP status code for errors, such as 500 Internal Server Error
  }
};
