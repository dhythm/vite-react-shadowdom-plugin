import { useState } from "react";
import appCss from "./App.css";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import { ShadowDOM } from "./components/ShadowDOM";
import indexCss from "./index.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <ShadowDOM>
      <style>{appCss}</style>
      <style>{indexCss}</style>
      <div className="App">
        <div>
          <a href="https://vitejs.dev" target="_blank">
            <img
              src={chrome.runtime.getURL(viteLogo)}
              className="logo"
              alt="Vite logo"
            />
          </a>
          <a href="https://reactjs.org" target="_blank">
            <img
              src={chrome.runtime.getURL(reactLogo)}
              className="logo react"
              alt="React logo"
            />
          </a>
        </div>
        <h1>Vite + React</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </div>
      </div>
    </ShadowDOM>
  );
}

export default App;
