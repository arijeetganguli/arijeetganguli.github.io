import { useContext } from "react";
import { SanariContext } from "../Context";

const SectionContainer = ({ name, children }) => {
  const { nav, animation } = useContext(SanariContext);
  return (
    <div
      id={name}
      className={`sanari_tm_section ${
        name == nav ? `animated active ${animation}` : ""
      }`}
    >
      {children}
    </div>
  );
};
export default SectionContainer;
