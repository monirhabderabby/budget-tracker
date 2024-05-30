"use client";
import { useTheme } from "next-themes";
import Image from "next/image";
import dashboardBlack from "../../../public/dash-black.webp";
import dashboardWhite from "../../../public/dash-white.webp";

const BannerImage = () => {
  const { theme } = useTheme();
  return (
    <div>
      <div className="px-4">
        <Image
          src={theme === "dark" ? dashboardBlack : dashboardWhite}
          alt="dashboard"
          width={1000}
          height={700}
          className="mt-5 rounded-xl border-2"
          priority
          placeholder="blur"
        />
      </div>
    </div>
  );
};

export default BannerImage;
