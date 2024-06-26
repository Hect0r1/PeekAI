import { useLocation } from 'react-router-dom';

const Results : React.FC = () => {
    const location = useLocation();
    const receivedData = location.state;
    console.log(receivedData);
    return (
        <div style={{fontSize:"15px"}}>
            <h1 style={{fontSize:"20px", padding:"20px", textAlign:"center"}}>Analysis results</h1>
            <p>Summary: {receivedData.summary}</p>
            <p style={{paddingTop:"8px"}}>Rating: {receivedData.rating}/5 stars</p>
            <div style={{color:"white", padding:"20px"}}>
                <p style={{fontSize:"18px", paddingBottom:"5px"}}>Categories checks for the mockup:</p>
                <ul>
                    <li>- Color: {receivedData.categories.color}</li>
                    <li>- Ctas: {receivedData.categories.ctas}</li>
                    <li>- Fonts: {receivedData.categories.fonts}</li>
                    <li>- Inconsistency: {receivedData.categories.inconsistency}</li>
                    <li>- Layout: {receivedData.categories.layout}</li>
                    <li>- Visual hierarchy: {receivedData.categories.visual_hierarchy}</li>
                    <li>- Whitespace: {receivedData.categories.whitespace}</li>
                </ul>
            </div>


            <p style={{paddingBottom:"10px"}}>Likeliness of developed website in comparison with the mockup: {receivedData.likeliness}%</p>

            <p style={{fontSize:"18px", paddingBottom:"5px"}}>Missing components in the website:</p>
            <ul style={{color:"white"}}>
                {
                   receivedData.missing_components? (
                    receivedData.missing_components.map((element, index) => (
                        <li key={index}>- {element}</li>
                    )))
                :
                    (<li>There were not missing UI components</li>)
                }
             
            </ul>
        </div>
    );
};



export default Results;
