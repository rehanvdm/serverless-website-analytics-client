// import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {Link} from "react-router-dom";
import {useState} from "react";
import {swaClient} from "./main.tsx";

function App() {
  const [count, setCount] = useState(0)

  function handleClick() {
    console.log('Click happened');
    setCount((count) => count + 1)
    swaClient.v1.analyticsTrack("react", count, "test")
  }

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
         <h2>Click to go to the <Link to={`/about`}>About</Link> page</h2>
        <button onClick={handleClick}>
          count is {count}
        </button>
      </div>

    </>
  )
}

export default App
