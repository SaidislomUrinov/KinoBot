import { CgSpinner } from "react-icons/cg";

function GlobalLoading() {
  return (
    <div className="flex items-center justify-center w-full h-[100vh] fixed top-0 left-0">
      <CgSpinner className="animate-spin text-[50px] text-white " />
    </div>
  );
}

export default GlobalLoading;
