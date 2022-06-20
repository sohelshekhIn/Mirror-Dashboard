import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { DashboardContent } from "../../../components/faculty/Navbar";
import Loading from "../../../components/utilities/Loading";
import NotificationAlert from "../../../components/utilities/NotificationAlert";
import PageNotFound from "../../404";

export default function AddNewTest() {
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
        <div class="collapse collapse-arrow">
          <input type="checkbox" id="showFormCheckbox" />
          <div class="collapse-title p-0">
            <div className="flex flex-col">
              <h1 className="heading1 text-primary">Add New Test</h1>
              <span className="underline w-24 my-4"></span>
            </div>
          </div>
          <div class="collapse-content p-0">Hello</div>
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
