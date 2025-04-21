import { Button } from "@material-tailwind/react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

function Genres() {
  const { genres } = useSelector((e) => e.genres);
  const nv = useNavigate();
  const [q] = useSearchParams();
  const gid = q.get("gid");
  return (
    <div className="flex items-center justify-start min-h-max gap-[10px] w-full overflow-x-scroll">
      <Button
        onClick={() => nv("?")}
        size="sm"
        color="white"
        className="rounded-full min-w-max"
        variant={!gid ? "gradient" : "text"}
      >
        Barchasi
      </Button>
      {genres?.map((g, i) => {
        return (
          <Button
            onClick={() => nv("?gid=" + g?._id)}
            size="sm"
            key={i}
            color="white"
            className="rounded-full min-w-max"
            variant={gid === g?._id ? "gradient" : "text"}
          >
            {g.name}
          </Button>
        );
      })}
    </div>
  );
}

export default Genres;
