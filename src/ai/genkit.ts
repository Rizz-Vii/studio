// import the Genkit and Google AI plugin libraries
import { gemini15Flash, googleAI } from "@genkit-ai/googleai";
import { genkit } from "genkit";

// configure a Genkit instance
export const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash, // set default model
});
