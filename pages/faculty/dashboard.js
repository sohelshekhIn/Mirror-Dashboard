import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { DashboardContent } from "../../components/faculty/Navbar";
import Loading from "../../components/utilities/Loading";
import PageNotFound from "../404";

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
  return (
    <DashboardContent>
      <div className="font-bold text-primary text-3xl">
        Hello, {data.user.name.split(" ")[0]}
      </div>
      <Link href="/faculty/attendance">Attendance</Link>
    </DashboardContent>
  );
}
