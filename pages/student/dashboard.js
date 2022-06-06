import { signIn, useSession } from "next-auth/react";
import Attendance from "../../components/student/Attendance";
import Homework from "../../components/student/Homework";
import TestResults from "../../components/student/TestResults";
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
  if (data.user && data.user.role !== "student") {
    return <PageNotFound />;
  }
  return (
    <div className="h-screen bg-white">
      <div className="w-full xs:px-0 lg:px-16 xl:px-48 3xl:px-96 flex flex-col bg-white ">
        <div className="flex flex-col lg:flex-row">
          <Attendance />
          <Homework />
        </div>
        <div className="flex flex-wrap">
          <TestResults />
        </div>
      </div>
    </div>
  );
}
