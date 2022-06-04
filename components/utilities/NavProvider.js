import { signIn, useSession } from "next-auth/react";
import Navbar from "../student/Navbar";
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
          <Navbar />
          <div className="mt-24">{children}</div>
        </>
      );
    } else {
      return children;
    }
  } else {
    return children;
  }
}
