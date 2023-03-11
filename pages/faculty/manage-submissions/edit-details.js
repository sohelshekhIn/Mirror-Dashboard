import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DashboardContent } from "../../../components/faculty/Navbar";
import StudentSubmissionsTableView from "../../../components/faculty/StudentSubmissionsTableView";
import Loading from "../../../components/utilities/Loading";
import NotificationAlert from "../../../components/utilities/NotificationAlert";
import PageNotFound from "../../404";

export default function EditTest() {
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

  const router = useRouter();
  const { id } = router.query;
  const [notification, setNotification] = useState({
    type: null,
    message: null,
  });
  const [tableComp, setTableComp] = useState([]);
  useEffect(() => {
    if (id !== undefined) {
      axios
        .get(process.env.NEXT_PUBLIC_STRAPI_API + "/submissions/" + id, {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        })
        .then((res) => {
          setTableComp(
            <StudentSubmissionsTableView
              editStudentDetails={res.data}
              setNotification={setNotification}
              session={data}
            />
          );
        })
        .catch((err) => {
          console.log(err);
          setNotification({
            type: "error",
            message: err.message,
            id: new Date(),
          });
        });
    }
  }, [id]);

  return (
    <DashboardContent>
      <span
        className="py-5 text-neutral cursor-pointer my-5"
        onClick={router.back}
      >
        Go Back
      </span>
      <div className="mt-5">{tableComp}</div>
      <NotificationAlert
        type={notification.type}
        message={notification.message}
        id={notification.id}
      />
    </DashboardContent>
  );
}
