import { useSession } from "next-auth/react";
import StudentNavbar from "../student/Navbar";
import FacultyNavbar from "../faculty/Navbar";
import Loading from "./Loading";

export default function NavProvider({ children }) {
  const { status, data } = useSession();
  if (status === "loading") {
    return <Loading />;
  }
  if (data) {
    if (data.user && data.user.role === "student") {
      return (
        <>
          <StudentNavbar session={data} />
          <div className="mt-24">{children}</div>
        </>
      );
    } else if (data.user && data.user.role === "faculty") {
      return (
        <>
          <FacultyNavbar session={data}>{children}</FacultyNavbar>
        </>
      );
    } else {
      return children;
    }
  } else {
    return children;
  }
}
