"use client";

// Packages
import { useTheme } from "next-themes";
import Image from "next/image";

// Components
import dashboardBlack from "../../../public/dash-black.webp";
import dashboardWhite from "../../../public/dash-white.webp";
import { BorderBeam } from "../magicui/border-beam";

const BannerImage = () => {
  const { theme } = useTheme();

  return (
    <div className="">
      <div className=" relative">
        <Image
          src={theme === "light" ? dashboardWhite : dashboardBlack}
          alt="dashboard"
          width={1000}
          height={700}
          className="mt-5 rounded-xl border-2 duration-300 hover:border-white/20"
          priority
          placeholder="blur"
        />
        <BorderBeam
          colorFrom="#fbbf24"
          colorTo="#f97316"
          size={250}
          duration={12}
          delay={9}
          className="rounded-lg"
        />
      </div>
    </div>
  );
};

export default BannerImage;
