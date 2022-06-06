import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
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
  console.log(data);
  return (
    <div className="mt-5">
      <div className="font-bold text-primary text-3xl">Hello, Sahil</div>
      <Link href="/faculty/attendance">Attendance</Link>
    </div>
  );
}
