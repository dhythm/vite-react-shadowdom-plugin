import { FC, ReactNode } from "react";
import root from "react-shadow/styled-components";

type Props = {
  children: ReactNode;
};
export const ShadowDOM: FC<Props> = ({ children }) => {
  return (
    <root.div id="plugin-root" style={{ all: "initial" }}>
      {children}
    </root.div>
  );
};
