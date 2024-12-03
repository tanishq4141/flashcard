const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config()

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model=genAI.getGenerativeModel({model:"gemini-1.5-flash"})


const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8000;

async function run(inputData){
   const result=await model.generateContent(inputData)
   const response=await result.response;
   const text=response.text();
  // console.log(text)
   return text
}

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (e.g., HTML)
app.use(express.static('public'));

// Handle form submission
app.post('/process', async (req, res) => {
    const inputData = req.body.inputData;
    try {
        const finalinput = inputData + " make 10 flashcards in JSON format with 'term' and 'definition' keys only.";
        const tanishq = await run(finalinput);

        // Locate the JSON structure in the AI response
        const startIndex = tanishq.indexOf('['); // Locate the start of the JSON array
        const endIndex = tanishq.lastIndexOf(']') + 1; // Locate the end of the JSON array

        if (startIndex === -1 || endIndex === -1) {
            throw new Error("Invalid JSON format in AI response.");
        }

        const flashcardsJson = tanishq.slice(startIndex, endIndex); // Extract JSON array
        const flashcards = JSON.parse(flashcardsJson); // Parse into JavaScript object

        console.log("Generated Flashcards:", flashcards);
        res.json(flashcards); // Send structured JSON to the client
    } catch (error) {
        console.error("Error during processing:", error);
        res.status(500).send("Error processing your request. Ensure the AI response is valid JSON.");
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});