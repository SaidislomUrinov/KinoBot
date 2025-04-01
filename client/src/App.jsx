import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getReq, postReq } from "./utils/req";
import { updateUser } from "./contexts/user";
import { errorMsg } from "./utils/alert";
import GlobalLoading from "./components/globalLoading";
// import Navbar from "./components/Navbar";
import Top from "./components/Top";
import Home from "./pages/Home";
import { updateGenres } from "./contexts/genres";
import Genres from "./components/Genres";
import Search from "./components/Search";
const tg = window.Telegram.WebApp;
function App() {
  const { id, access } = useSelector((e) => e.user);
  const dp = useDispatch(useEffect);
  const [load, setLoad] = useState(false);
  //
  useEffect(() => {
    tg.ready();
    tg.expand();
    const { id: uId, first_name, photo_url } = tg?.initDataUnsafe.user;
    // const uId = 5991285234;
    // const first_name = "Saidislom";
    // const photo_url = "https://picsum.photos/100/100";
    if (!id) {
      postReq("/user/signIn", { id: uId, first_name, photo_url })
        .then((res) => {
          const { ok, token } = res.data;
          if (ok) {
            dp(
              updateUser({
                id: uId,
                name: first_name,
                photo: photo_url,
                access: token,
              })
            );
          }
        })
        .catch(() => {
          errorMsg();
        })
        .finally(() => {
          setLoad(true);
        });
    }
  }, []);
  //
  useEffect(() => {
    if (id) {
      getReq("/user/getGenres", {}, access)
        .then((res) => {
          const { ok, genres, msg } = res.data;
          if (ok) {
            dp(updateGenres(genres));
          } else {
            errorMsg(msg);
          }
        })
        .catch(() => {
          errorMsg();
        });
    }
  }, [id]);
  if (!load) return <GlobalLoading />;
  return (
    <>
      <Top />
      <div className="flex gap-[20px] items-center justify-start flex-col w-full p-[10px] pt-[70px] pb-[110px]">
        <Search />
        <Genres />
        <Home />
      </div>
      {/* <Navbar /> */}
    </>
  );
}

export default App;
