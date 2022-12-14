import { useState } from "react";
import appCss from "./App.css";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import { ShadowDOM } from "./components/ShadowDOM";
import indexCss from "./index.css";

function App() {
  const [count, setCount] = useState(0);
  const [nestedCount, setNestedCount] = useState(0);

  return (
    <ShadowDOM>
      <div
        style={{
          position: "absolute",
          top: 0,
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
              onClick={() => setCount((prev) => prev + 1)}
            >
              count is {count}
            </button>
            <ShadowDOM>
              <div className="card">
                <button
                  className="shadow"
                  onClick={() => setNestedCount((prev) => prev + 1)}
                >
                  nested count is {nestedCount}
                </button>
              </div>
            </ShadowDOM>
          </div>
          <div>
            <div className="card">
              <button
                style={{ color: "#ffffff", backgroundColor: "#000000" }}
                onClick={(event) => {
                  event.stopPropagation();
                  console.log("stopPropagation is clicked");
                }}
              >
                stop propagation
              </button>
            </div>
            <div className="card">
              <button
                style={{ color: "#ffffff", backgroundColor: "#000000" }}
                onClick={(event) => {
                  console.log("propagated is clicked");
                }}
              >
                propagated
              </button>
            </div>
          </div>
        </div>
      </div>
    </ShadowDOM>
  );
}

export default App;
