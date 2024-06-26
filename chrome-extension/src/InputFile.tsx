/*global chrome*/
import React, { useEffect, useState } from "react";
import { useNavigate  } from "react-router-dom";
import predict from "./ModelAPI";
import LoadingIcons from 'react-loading-icons';

// Convert an image file to a base64 string
function fileToBase64(
  file: File,
  callback: (base64String: string, fileName: string) => void
) {
  const reader = new FileReader();
  reader.onload = function (event) {
    if (event.target) {
      callback(event.target.result as string, file.name);
    }
  };
  reader.readAsDataURL(file);
}

const InputFile: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  useEffect(() => {
    chrome.tabs.captureVisibleTab({ format: "png" }, (dataUrl) => {
      setScreenshotUrl(dataUrl);
    });
    try {
      chrome.storage.local.get(["imageURL", "feedback"], function (result) {
        const imageURL = result.imageURL;
        const feedback = result.feedback;
        if (imageURL && feedback) {
          const feedbackImage = [{"url": imageURL}, feedback];
          navigate("/index.html/Feedback", { state: feedbackImage });
        }
      });
    } catch (error) {
        console.error("Something went wrong while retrieveing image url and feedback from local storage");
    }
  }, [navigate]);

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setImageSrc(null);
    const file = event.target.files![0];

    if (file) {
      fileToBase64(file, (base64String) => {
        setImageSrc(base64String);
      });
    }
  };
 
  const handleAnalyze = () => {
    setIsLoading(true);
    predict(screenshotUrl!.toString(), imageSrc!.toString()).then((response) => {
      setIsLoading(false);
      navigate("/index.html/Feedback", { state: response });
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 m-8 space-y-4" id = "analyze_button">
      {!isLoading ? (
        <button
          onClick={handleAnalyze}
          className="
            bg-[#489FAB]
            hover:bg-[#3E7F8E]
            text-white
            font-bold
            focus:outline-none
            focus:shadow-outline
            mb-4
            py-2
            px-4
            w-3/4
            text-lg
            rounded-xl
            font-sans
            "
        >
          Analyze
        </button>
      ) : (
      <LoadingIcons.TailSpin />  
      )}

      {imageSrc == null ? (
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-4 border-[#489FAB] border-dashed rounded-lg cursor-pointer bg-[#333333] 
          hover:bg-[#3E3E3E]  transition duration-300 ease-in-out 
          "
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                width="44"
                height="40"
                viewBox="0 0 44 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mb-4"
              >
                <path
                  d="M2 38H42"
                  stroke="white"
                  stroke-width="3"
                  stroke-linecap="round"
                />
                <path
                  d="M2 38V27"
                  stroke="white"
                  stroke-width="3"
                  stroke-linecap="round"
                />
                <path
                  d="M42 38V27"
                  stroke="white"
                  stroke-width="3"
                  stroke-linecap="round"
                />
                <path
                  d="M20.5 30C20.5 30.8284 21.1716 31.5 22 31.5C22.8284 31.5 23.5 30.8284 23.5 30H20.5ZM23.0607 0.939341C22.4749 0.353554 21.5251 0.353554 20.9393 0.939341L11.3934 10.4853C10.8076 11.0711 10.8076 12.0208 11.3934 12.6066C11.9792 13.1924 12.9289 13.1924 13.5147 12.6066L22 4.12132L30.4853 12.6066C31.0711 13.1924 32.0208 13.1924 32.6066 12.6066C33.1924 12.0208 33.1924 11.0711 32.6066 10.4853L23.0607 0.939341ZM23.5 30V2H20.5V30H23.5Z"
                  fill="white"
                />
              </svg>
              <p className="mb-2 text-2xl font-semibold text-white ">
                Drag Mockup
              </p>
              <p className="mb-2 text-lg font-thin text-white ">or</p>
              <div
                className="flex items-center justify-center w-32 font-thin text-white rounded-lg cursor-pointer
                border-2 border-[#489FAB] hover:bg-[#489FAB] hover:text-black transition duration-300 ease-in-out
                font-sans
                mb-4
                text-lg
            "
              >
                Choose mockup
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG or JPG
              </p>
            </div>
          </label>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
      ) : (
        <div style={{width: "115%", paddingRight: "10px"}}>
          <img src={imageSrc} alt="Mockup image" />    
        </div>
      )}
      
    </div>
    );
  };

export default InputFile;
