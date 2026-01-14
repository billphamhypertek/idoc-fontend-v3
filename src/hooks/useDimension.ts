import { useEffect, useState } from "react";

export default function useDimension() {
  const [windowWidth, setWindowWidth] = useState(0);

  const onResize = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", onResize);
    setWindowWidth(window.innerWidth);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return {
    windowWidth,
    isSM: windowWidth < 768,
    isMD: windowWidth >= 768,
    isLG: windowWidth >= 1024,
    isXL: windowWidth >= 1440,
  };
}
