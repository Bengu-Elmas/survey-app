import { Link } from "react-router-dom";
function Navbar() {
  return (
    <nav>
      <Link to="/">Anketlerim</Link>
      {" | "}
      <Link to="/create">Yeni Anket Oluştur</Link>
    </nav>
  );
}

export default Navbar;
