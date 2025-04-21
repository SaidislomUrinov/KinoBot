import { useEffect, useState, useCallback } from "react";
import { getReq } from "../utils/req";
import { errorMsg } from "../utils/alert";
import Mapping from "../components/Mapping";
import { useSearchParams } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import { useSelector } from "react-redux";

function Home() {
  const { access } = useSelector((e) => e?.user);
  const [load, setLoad] = useState(false); // Boshlang‘ich yuklanish
  const [disabled, setDisabled] = useState(false); // Keyingi yuklanish uchun
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [next, setNext] = useState(false);
  const [q] = useSearchParams();

  const genre = q.get("gid");
  const searchQuery = q.get("search");

  // Ma'lumotlarni yuklash funksiyasi
  const fetchData = useCallback(
    async (reset = false, customPage = page) => {
      if (reset) {
        setData([]); // Qidiruv yoki janr o‘zgarsa, ma'lumotni tozalash
        setPage(1);
      }
      setDisabled(true); // Tugmani bloklash

      let url = `/user/getAllMedia?page=${customPage}`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      } else if (genre) {
        url += `&genre=${genre}`;
      }

      try {
        const res = await getReq(url, {}, access);
        const { ok, data, msg, nextPage } = res.data;
        if (ok) {
          setData((prev) => (reset ? data : [...prev, ...data])); // Reset bo‘lsa almashtiradi, bo‘lmasa qo‘shadi
          setNext(nextPage);
        } else {
          errorMsg(msg);
        }
      } catch (error) {
        errorMsg("Xatolik yuz berdi!");
      } finally {
        if (reset) setLoad(true);
        setDisabled(false); // Tugmani qayta yoqish
      }
    },
    [searchQuery, genre, page]
  );

  // Faqat dastlabki yuklash uchun
  useEffect(() => {
    fetchData(true);
  }, []); // Bo‘sh dependency array

  // Genre yoki search o‘zgarganda qayta yuklash
  useEffect(() => {
    fetchData(true);
  }, [searchQuery, genre]);

  // Keyingi sahifani yuklash
  const nextPage = () => {
    if (disabled) return;
    setPage((prev) => prev + 1);
    fetchData(false, page + 1);
  };
  useEffect(() => {
    if (data.length > 30) {
      window.scrollTo({
        top: window.scrollY + 300,
        behavior: "smooth",
      });
    }
  }, [data]);
  return (
    <div className="flex items-center justify-start flex-col gap-[10px] w-full">
      <Mapping data={data} loading={load} />
      {next && (
        <Button
          fullWidth
          color="white"
          className="rounded-full"
          disabled={disabled}
          loading={disabled}
          onClick={nextPage}
        >
          Yana 30 ta
        </Button>
      )}
    </div>
  );
}

export default Home;
