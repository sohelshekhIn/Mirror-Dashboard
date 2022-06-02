import { useSession, signIn } from "next-auth/react";
import PageNotFound from "./404";
import Loading from "../components/utilities/Loading";
import StudentDashboard from "../components/Students";

export default function Dashboard() {
  const { status, data } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });

  if (status === "loading") {
    return <Loading />;
  }

  if (data.user && data.user.role === "students") {
    return <StudentDashboard />;
  } else if (data.user) {
    return <PageNotFound />;
  }
}
