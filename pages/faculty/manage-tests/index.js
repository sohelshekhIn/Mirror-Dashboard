import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { DashboardContent } from "../../../components/faculty/Navbar";
import Loading from "../../../components/utilities/Loading";
import NotificationAlert from "../../../components/utilities/NotificationAlert";
import PageNotFound from "../../404";

export default function ManageTests() {
  const { status, data } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });
  if (status === "loading") {
    return <Loading />;
  }
  if (
    (data.user && data.user.role !== "faculty") ||
    !data.user.facultyData["facultyRoles"].includes(17)
  ) {
    return <PageNotFound />;
  }

  // === Main ===
  const [notification, setNotification] = useState({
    type: null,
    message: null,
  });
  return (
    <DashboardContent>
      <div className="flex flex-col">
        <div className="flex flex-col">
          <h1 className="heading1 text-primary">Manage Tests</h1>
          <span className="underline w-24 my-4"></span>
        </div>
        <div className="flex flex-col max-w-xl space-y-5 ">
          <div className="flex justify-end">
            <Link href="/faculty/manage-tests/new-test">
              <a className="btn btn-accent">Add new Test</a>
            </Link>
          </div>
          <div className="flex flex-col max-w-xl">
            <Link href="/faculty/manage-tests/edit-details">
              <a>
                <div className="flex flex-col lg:flex-row p-5 py-8 space-y-1 w-full bg-white rounded-xl shadow-xl hover:scale-105">
                  <div className="flex flex-row lg:flex-col w-full lg:w-2/12 justify-between lg:justify-center">
                    <p className="text-base">20/06/2020</p>
                    <p className="text-base">Chemistry</p>
                  </div>
                  <div className="divider divider-horizontal"></div>
                  <div className="flex flex-col w-9/12 justify-center">
                    <h1 className="font-medium text-secondary text-xl">
                      Ch 3 Electrochemistry Full Length Test
                    </h1>
                  </div>
                </div>
              </a>
            </Link>
          </div>
        </div>
      </div>
      <NotificationAlert
        type={notification.type}
        message={notification.message}
        id={notification.id}
      />
    </DashboardContent>
  );
}
