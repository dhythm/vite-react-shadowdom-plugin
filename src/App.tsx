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
      <div
        style={{
          position: "absolute",
          right: 0,
          left: 0,
          height: 0,
        }}
      >
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
          <div className="card">
            <button
              className="shadow"
              onClick={() => setCount((count) => count + 1)}
            >
              count is {count}
            </button>
          </div>
        </div>
      </div>
    </ShadowDOM>
  );
}

export default App;
