import { signIn, useSession } from "next-auth/react";
import Loading from "../../../components/utilities/Loading";
import PageNotFound from "../../404";

export default function StudentDashboard() {
  const { status, data } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });
  if (status === "loading") {
    return <Loading />;
  }
  if (data.user && data.user.role !== "faculty") {
    return <PageNotFound />;
  }
  return "Facultty Dashboard";
}
