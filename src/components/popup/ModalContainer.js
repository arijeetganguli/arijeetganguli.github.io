import { SanariContext } from "@/src/Context";
import useClickOutside from "@/src/useClickOutside";
import { useContext } from "react";
const ModalContainer = ({ children, nullValue }) => {
  const { modalToggle } = useContext(SanariContext);
  let domNode = useClickOutside(() => {
    modalToggle(false);
    nullValue(null);
  });
  return (
    <div className="sanari_tm_modalbox opened">
      <div className="box_inner" ref={domNode}>
        <div className="close">
          <a
            href="#"
            onClick={() => {
              modalToggle(false);
              nullValue(null);
            }}
          >
            <i className="icon-cancel" />
          </a>
        </div>
        <div className="description_wrap">{children}</div>
      </div>
    </div>
  );
};
export default ModalContainer;
