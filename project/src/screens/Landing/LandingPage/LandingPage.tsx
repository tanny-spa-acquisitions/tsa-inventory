import { ThemeType } from "../../../util/appTheme";
import { appTheme } from "../../../util/appTheme";
import appDetails from "../../../util/appDetails.json";
import PageLayout from "@/layouts/pageLayout";
import Image from "next/image";

const LandingPage = async () => {
  const currentTheme = appDetails.default_theme as ThemeType;

  return (
    <div
      style={
        {
          "--nav-height": `${appDetails.nav_height}px`,
          "--left-bar-width": 0,
        } as React.CSSProperties
      }
      className={`absolute left-0 top-[var(--nav-height)] w-[100vw] flex h-[calc(100vh-var(--nav-height))] overflow-scroll`}
    >
      <img
        src="/assets/bg.webp"
        alt="logo"
        className="select-none w-[100vw] h-[100%] object-cover"
      />
    </div>
  );
};

export default LandingPage;
