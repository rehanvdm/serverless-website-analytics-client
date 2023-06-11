import './App.css'
import {Link} from "react-router-dom";

function About() {
  return (
    <>
      <h1>About</h1>
      <p>Some about stuff</p>
      <h2>Click to go to the <Link to={`/`}>Home</Link> page</h2>
    </>
  )
}

export default About
