import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardHandler from "../components/utilities/DashbordHandler";

export default function PageNotFound() {
  const { data, status } = useSession();
  const [facultyUiClass, setFacultyUiClass] = useState("justify-center");

  useEffect(() => {
    if (data && data.user && data.user.role === "faculty") {
      setFacultyUiClass("justify-start lg:pl-[5%] xl:pl-[10%] 3xl:pl-[10%]");
    }
  }, [data, status]);

  return (
    <div
      className={`
    flex
    fixed
    items-center
    w-screen
    h-screen
    bg-gradient-to-r
    from-primary
    to-blue-400
    ${facultyUiClass}
  `}
    >
      <div className="px-20 md:px-40 py-20 bg-white rounded-md shadow-xl">
        <div className="flex flex-col items-center">
          <h1 className="font-bold text-blue-600 text-9xl">404</h1>

          <h6 className="mb-2 text-2xl font-bold text-center text-gray-800 md:text-3xl">
            <span className="text-red-500">Oops!</span> Page not found
          </h6>

          <p className="mb-8 text-center text-gray-500 md:text-lg">
            The page you’re looking for doesn’t exist.
          </p>
          <Link href={DashboardHandler({ session: false, wantUrl: true })}>
            <a className="px-6 py-2 text-sm font-semibold text-blue-800 bg-blue-100">
              Go Dashboard
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
