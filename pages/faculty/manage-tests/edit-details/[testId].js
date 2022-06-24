import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DashboardContent } from "../../../../components/faculty/Navbar";
import Loading from "../../../../components/utilities/Loading";
import NotificationAlert from "../../../../components/utilities/NotificationAlert";
import PageNotFound from "../../../404";

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
  if (
    (data.user && data.user.role !== "faculty") ||
    !data.user.facultyData["facultyRoles"].includes(19)
  ) {
    return <PageNotFound />;
  }

  const router = useRouter();
  const { testId } = router.query;
  const [notification, setNotification] = useState({
    type: null,
    message: null,
  });

  useEffect(() => {
    axios
      .get(process.env.NEXT_PUBLIC_STRAPI_API + "/marks/" + testId, {
        headers: {
          Authorization: `Bearer ${data.user.accessToken}`,
        },
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
        setNotification({
          type: "error",
          message: err.message,
          id: new Date(),
        });
      });
  }, []);

  return (
    <DashboardContent>
      <NotificationAlert
        type={notification.type}
        message={notification.message}
        id={notification.id}
      />
    </DashboardContent>
  );
}
