// index.js
exports.yourCloudFunction = async (req, res) => {
  require("dotenv").config(); // Ensure your environment variables are loaded
  const OpenAI = require("openai");

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // Assuming the user's message is sent in the request body as 'userMessage'
    const userMessage = req.body.userMessage;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "system",
          content:
            'You are a Chrome Extension that generates privacy warnings in different categories by analyzing an EULA. JSON Response Example:\n\n{\n  "warnings": [\n    {\n      "warning_code": 1,\n      "category": "Location",\n      "description": "This application tracks location."\n    },\n    {\n      "warning_code": 2,\n      "category": "Personal Data Access",\n      "description": "Will have access to personal data - Image, SMS etc."\n    }\n  ]\n}',
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Extracting generated warnings from the response
    const generatedWarnings = response.choices.map(
      (choice) => choice.message.content
    );

    res.status(200).send(response.choices[0].message.content);

    // console.log(response);
    // console.log(response.choices[0].message.content);
  } catch (error) {
    res.status(500).send("Error generating warnings: " + error); // Set an appropriate HTTP status code for errors, such as 500 Internal Server Error
  }
};
