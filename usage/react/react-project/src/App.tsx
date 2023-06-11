// import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {Link} from "react-router-dom";

function App() {
  // const [count, setCount] = useState(0)

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
        {/*<button onClick={() => setCount((count) => count + 1)}>*/}
        {/*  count is {count}*/}
        {/*</button>*/}
         <h2>Click to go to the <Link to={`/about`}>About</Link> page</h2>
      </div>

    </>
  )
}

export default App
