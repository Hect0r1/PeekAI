import { Client } from "@gradio/client";


async function predict(screenShot:string, userImage:string): Promise<void> {
    screenShot = screenShot.split(',')[1]
    userImage = userImage.split(',')[1];

    const app = await Client.connect("a01639224/PeekAI");
    const result = await app.predict("/predict", [		
      userImage, // string  in 'Mockup' Textbox component		
      screenShot, // string  in 'Screenshot' Textbox component
    ]);

    return result.data;
}

export default predict;
