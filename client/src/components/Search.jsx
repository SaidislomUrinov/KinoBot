import { Button } from "@material-tailwind/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Search() {
  const [search, setSearch] = useState("");
  const nv = useNavigate();
  function runSearch() {
    nv(`?search=${search}`);
    setSearch("");
  }
  return (
    <div className="flex items-center justify-center w-full min-h-[45px] relative">
      <input
        type="text"
        className="w-full h-full text-white text-[13px] placeholder:text-gray-300/50 bg-[#00000053] rounded-full p-[0_50px_0_20px] border border-blue-100/50 focus:border-blue-500"
        placeholder="Qidiruv: Nomi"
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      />
      <div className="absolute right-[5px]">
        <Button
          size="sm"
          color="white"
          className="rounded-full"
          disabled={search.length < 3}
          onClick={runSearch}
        >
          Qidirish
        </Button>
      </div>
    </div>
  );
}

export default Search;
