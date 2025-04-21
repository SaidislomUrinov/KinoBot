import { API, postReq } from "../utils/req";
import { FaDotCircle, FaImage, FaPlay, FaSmile } from "react-icons/fa";
import { Button, Chip } from "@material-tailwind/react";
import { useState } from "react";
import { errorMsg, successMsg } from "../utils/alert";
import { CgSpinner } from "react-icons/cg";
import { useSelector } from "react-redux";
const tg = window.Telegram.WebApp;
const Loading = () => {
  return (
    <div className="flex items-center justify-between w-full flex-wrap gap-[10px]">
      {Array.from({ length: 4 }).map((_, i) => {
        return (
          <div
            className="w-[48%] gap-[10px] animate-pulse flex items-start justify-start flex-col"
            key={i}
          >
            <div className="flex bg-gray-300 items-center mb-[10px] justify-center w-full rounded-[20px] aspect-square overflow-hidden">
              <FaImage />
            </div>
            <p className="flex items-center justify-center">
              <span className="w-[130px] h-[18px] bg-gray-300 rounded-full"></span>
            </p>
            <p className="text-[12px] mb-[10px] gap-2 flex items-center justify-start text-gray-300">
              <FaDotCircle className="text-gray-300" />
              <span className="w-[100px] h-[18px] bg-gray-300 rounded-full"></span>
            </p>
            <Button
              disabled
              className="w-full rounded-full"
              size="sm"
              color="white"
              variant="gradient"
            >
              play
              <FaPlay />
            </Button>
          </div>
        );
      })}
    </div>
  );
};
function Mapping({ data = [], loading = true }) {
  const { access } = useSelector((e) => e?.user);

  const [movie, setMovie] = useState({
    _id: "",
    name: "",
    imagePath: "",
    year: 2000,
    duration: "",
    type: "",
    desc: "",
    genres: "",
    isPremium: false,
    mediaIds: [],
  });
  const closeMovie = () => {
    setMovie({
      _id: "",
      name: "",
      imagePath: "",
      year: 2000,
      type: "",
      desc: "",
      genres: "",
      isPremium: false,
      mediaIds: [],
    });
  };
  const [disabled, setDisabled] = useState(false);
  const [disabledIndex, setDisabledIndex] = useState(-1);
  const showMovie = () => {
    setDisabled(true);
    postReq("/user/sendMe", { _id: movie?._id }, access)
      .then((res) => {
        const { ok, msg } = res.data;
        if (ok) {
          successMsg(msg);
          setTimeout(() => {
            tg?.close();
          }, 1000);
        } else {
          errorMsg(msg);
        }
      })
      .catch(() => {
        errorMsg();
      })
      .finally(() => {
        setDisabled(false);
      });
  };
  const showSerial = (index) => {
    setDisabled(true);
    setDisabledIndex(index);
    postReq("/user/sendMe", { _id: movie?._id, index }, access)
      .then((res) => {
        const { ok, msg } = res.data;
        if (ok) {
          successMsg(msg);
          setTimeout(() => {
            tg?.close();
          }, 1000);
        } else {
          errorMsg(msg);
        }
      })
      .catch(() => {
        errorMsg();
      })
      .finally(() => {
        setDisabledIndex(-1);
        setDisabled(false);
      });
  };
  if (!loading || !data?.[0]) {
    return <Loading />;
  }
  return (
    <div className="flex items-start justify-between gap-[10px] w-full flex-wrap">
      {data?.map((d, i) => {
        return (
          <div
            onClick={() => setMovie(d)}
            className="w-[48%] flex items-start justify-start flex-col"
            key={i}
          >
            <div className="flex items-center mb-[10px] justify-center w-full rounded-[20px] aspect-square overflow-hidden">
              <img src={`${API}${d?.imagePath}`} alt="" />
            </div>
            <p className="text-[16px] text-white font-semibold w-full truncate">
              {d?.name}
            </p>
            <p className="text-[12px] mb-[10px] gap-2 flex items-center justify-start text-gray-300">
              <FaDotCircle className="text-white" />
              {d?.type === "movie" ? "Kino" : "Serial"}
            </p>
            <Button
              className="w-full rounded-full"
              size="sm"
              color="red"
              variant="gradient"
            >
              play
              <FaPlay />
            </Button>
          </div>
        );
      })}
      {/*  */}
      <div
        className={`flex items-center duration-500 z-[4] bg-[#0009] justify-end w-full h-[100vh] fixed left-0 flex-col ${
          !movie?._id ? "bottom-[-100vh]" : "bottom-0"
        }`}
      >
        <div
          onClick={closeMovie}
          className="absolute bottom-0 left-0 w-full h-[100vh] z-[3]"
        ></div>
        {/*  */}
        <div className="flex items-center justify-start flex-col w-full z-[4] h-[80vh] bg-gray-900 border-t rounded-t-[30px] p-[20px] border-t-red-500">
          {/*  */}
          <div className="flex items-center relative justify-center w-full h-[150px] rounded-[20px] overflow-hidden">
            <img
              src={API + movie?.imagePath}
              className="w-full"
              alt="media_img"
            />
            <div className="absolute w-full flex items-center justify-center flex-col h-full bg-[#000000a8]">
              <p className="font-bold text-white">{movie?.name}</p>
              <p className="text-[12px] text-white">{movie?.genres}</p>
              {movie?.type === "movie" && (
                <p className="text-[12px] text-gray-400">
                  Davomiyligi: {movie?.duration}
                </p>
              )}
              {movie?.type === "serial" && (
                <p className="text-[12px] text-gray-400">
                  Qismlar: {movie?.mediaIds?.length}
                </p>
              )}
            </div>
            <div className="absolute top-[5px] right-[5px] p-[5px]">
              {movie?.isPremium && (
                <Chip color="red" variant="gradient" value="PREMIUM" />
              )}
            </div>
            <div className="absolute top-[5px] left-[5px] p-[5px]">
              <Chip color="yellow" variant="gradient" value={movie?.year} />
            </div>
          </div>
          {/*  */}
          {movie?.type === "movie" ? (
            <Button
              loading={disabled}
              onClick={showMovie}
              className="w-full mt-[20px]"
              color="red"
              variant="gradient"
            >
              Ko'rish
              <FaPlay />
            </Button>
          ) : (
            <div className="flex items-start h-[50vh] w-full overflow-y-scroll justify-start gap-[10px] flex-col">
              <div className="flex items-center justify-center w-full gap-1 my-[10px]">
                <span className="w-[100px] h-[1px] bg-blue-gray-300"></span>
                <p className="text-gray-400 uppercase text-[12px]">
                  Qismlardan Tanlang
                </p>
                <span className="w-[100px] h-[1px] bg-blue-gray-300"></span>
              </div>
              {movie?.mediaIds?.map((m, i) => {
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between min-h-[50px] rounded-[10px] px-[10px] w-full bg-[#ffffff19]"
                  >
                    <p className="text-[14px] text-gray-300 font-semibold">
                      {i + 1}-Qism
                    </p>
                    <p className="text-[14px] text-gray-300">{m?.duration}</p>
                    <Button
                      disabled={disabled}
                      onClick={() => showSerial(i)}
                      color="red"
                      variant="gradient"
                      size="sm"
                    >
                      {disabledIndex !== i ? (
                        <>
                          Ko'rish
                          <FaPlay />
                        </>
                      ) : (
                        <CgSpinner className="animate-spin" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
          <div className="absolute left-0 px-[20px] bottom-[10px] w-full">
            <Button fullWidth color="white" onClick={closeMovie}>
              Yopish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mapping;
