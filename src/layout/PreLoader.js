import { useEffect } from "react";
import { sanari } from "../utils";

const PreLoader = () => {
  useEffect(() => {
    sanari.preloader();
  }, []);

  return (
    <div id="preloader">
      <div className="loader_line"></div>
    </div>
  );
};
export default PreLoader;
