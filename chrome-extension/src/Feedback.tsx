import { useLocation } from 'react-router-dom';
import { useNavigate  } from "react-router-dom";

const Feedback : React.FC = () => {
    const location = useLocation();
    const receivedData = location.state;
    const imageWithDetections = receivedData[0].url;
    chrome.storage.local.set(
        { imageURL: imageWithDetections, feedback: receivedData[1]});
    const feedback:Array<string> = receivedData[1].split('\n');
    let feedbackInPs;
    if (feedback[0] == "¡Felicidades, tu Mockup y tu Código son iguales!") {
        feedbackInPs = feedback.map(line => {
            return <p style={{position:"relative", bottom: "30px", textAlign: "center"}}>{line}</p>
        });
    }
    else {
        feedbackInPs = feedback.map(line => {
            return line == "" ? <br></br> : <p>{line}</p>
        });
    }

    function displayImageInNewTab():void {
        chrome.tabs.create({
            url: imageWithDetections
          });
    }
    const navigate = useNavigate();
    function returnInputFile():void {
        chrome.storage.local.clear();
        navigate("/index.html");
    }

    return (
        <div style={{paddingTop: "30px"}}>
            <div>
                <img src={imageWithDetections}/>
            </div>
            <div style={{display: "flex", justifyContent: "center", paddingTop: "35px"}}>
                <button
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
                    onClick={displayImageInNewTab}>Open image in a new tab
                </button>
            </div>
            <br></br>
            <br></br>
            <br></br>
            <div style={{fontSize: "18px"}}>
                <div>{feedbackInPs}</div>
            </div>
            <div style={{width: "30%", position: "relative", top:"30px"}}>
                <button 
                    style={{textAlign: "left"}}
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
                    onClick={returnInputFile}>Back
                </button>
            </div>
        </div>
    );
};



export default Feedback;
