import InputFile from "./InputFile";
import peekAILogo from "./assets/peekai.svg";
import Feedback from "./Feedback";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

function App() {
  return (
    <>
      <div className="flex items-center justify-center m-4">
        <img src={peekAILogo} alt="PeekAi Logo" />
        <h1 className="mx-2 text-3xl font-bold select-none">PEEK.AI</h1>
      </div>
      <Router>
          <Routes>
            <Route
            path="/index.html"
            element={<InputFile />}
            />
          <Route
            path="/index.html/Feedback"
            element={<Feedback/>}
            />
          </Routes>
        </Router>
    </>
  );
}

export default App;
