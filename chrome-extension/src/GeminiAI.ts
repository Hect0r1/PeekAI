import { GoogleGenerativeAI } from "@google/generative-ai";

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

const imageParser = (base64String: string) => {
  const mimeType = "image/";
  return {
    inlineData: {
      data: base64String.split(",")[1],
      mimeType:
        mimeType + base64String.split(",")[0].split(";")[0].split("/")[1],
    },
  };
};

// Function to convert image data to a GoogleGenerativeAI.Part object
function getImageFromtorage(): Promise<{
  inlineData: { data: string; mimeType: string };
}> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["imageData", "imageFileName"], function (result) {
      if (result) {
        resolve(imageParser(result.imageData));
      } else {
        reject("No image data found in chrome.storage.local");
      }
    });
  });
}

async function run(currentScreen: string): Promise<string> {
  // For text-and-image input (multimodal), use the gemini-pro-vision model
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  const prompt = `
From now on you are a tool for checking the ui of websites. You will return 3 jsons:

The first json:
Will contain information about the first image that is the mockup of a website, ; and the second image will be the state of the current website already developed. 
First, give a small, concise and straight to the point, summary of the findings. To rate the mockup, you'll consider things like: 
visual hierarchy, color, layout, clear CTAs, whitespace, inconsistency, fonts, and more from the second screenshot. 
Group these characteristics into categories (keep it in maximum 6 categories) that, based on norms and rules of ui, you'll 
give a checkbox response, "passed" or "failed". At the end, you will rate it in a number scale, from 0 to 5.  If needed, you can also give a retrospective on what 
to do to improve it, but keep it short. Remember to keep everything concise and straight to the point.

The second json:
Will be a section that says if the current website and the mockup are identical or not, if they are identical then a section that says "likeliness" will
be equal to 100% if they are not identical then set the percentage to something below 100%, the parameters to determine if both images
are identical or not are the following: checking if specific user interface components are the same like logos, icons, texts, sesarch bars, headings and links.
Also mention what components are missing on the current page from the mockup if there are any if there 
are not any component missing then just leave the array of that section as empty on the JSON.

REMEMBER THAT THE RESULTS MUST BE IN JSON.
Do not give me the json formatting, just give me the raw json so I can parse it. DO NOT RETURN IT IN MARKDOWN.
`;

  try {
    const imageParts = await Promise.all([
      await getImageFromtorage(),
      imageParser(currentScreen),
    ]);
    // console.log(imageParts[0]);
    // console.log([prompt, ...imageParts]);
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = await response.text();

    // console.log(text);
    return text;
  } catch (error) {
    console.error(error);
    return "Error: " + error;
  }
}

export default run; // Export the run function as default
