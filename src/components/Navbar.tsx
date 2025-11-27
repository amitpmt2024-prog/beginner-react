import { Link, Route, Routes } from "react-router";
import About from "./About";
import Contact from "./Contact";

const Navbar = () => {
    return ( <nav className="navbar">
    <h1>Blog</h1>
     <div>
      <nav>
        <Link to="/about">About</Link> 
        <Link to="/contact">Contact</Link>
      </nav>

      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
    </nav> );
}
 
export default Navbar;