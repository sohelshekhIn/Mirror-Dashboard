import { loadingAnimation } from "../../public/images";
import Image from "next/image";

export default function Loading() {
  return (
    <>
      <div className="hiden translate-y-96"></div>
      <div className="bg-base-100 w-full h-full fixed flex justify-center">
        <span className="flex flex-col justify-center">
          <Image src={loadingAnimation} priority />
        </span>
      </div>
    </>
  );
}
