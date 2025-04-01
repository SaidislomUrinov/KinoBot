import {
  BiSolidDashboard,
  BiSolidHeart,
  BiSolidMoviePlay,
} from "react-icons/bi";
import { FaHome } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const NavLink = ({ to = "", name = "", icon }) => {
  const Icon = icon;
  const p = useLocation().pathname;
  return (
    <Link
      to={to}
      className={`w-1/4 flex items-center justify-center flex-col ${
        p === to ? "text-white" : "text-gray-500"
      }`}
    >
      <div
        className={`flex items-center justify-center w-[40px] h-[40px] rounded-[10px] ${
          p === to ? "bg-gradient-to-br from-red-500" : ""
        }`}
      >
        <Icon className="text-[25px]" />
      </div>
      <span className="text-[11px] uppercase">{name}</span>
    </Link>
  );
};
function Navbar() {
  return (
    <div className="flex items-start justify-center w-full z-[2] h-[90px] fixed bottom-0 left-0">
      <div className="flex items-center justify-between w-[90%] h-[80px] px-[10px] rounded-[20px] bg-[#0009] backdrop-blur-sm">
        <NavLink to="/" name="Boshiga" icon={FaHome} />
        <NavLink to="/genres" name="Janrlar" icon={BiSolidDashboard} />
        <NavLink to="/movies" name="Kinolar" icon={BiSolidMoviePlay} />
        <NavLink to="/saved" name="Saqlangan" icon={BiSolidHeart} />
      </div>
    </div>
  );
}

export default Navbar;
