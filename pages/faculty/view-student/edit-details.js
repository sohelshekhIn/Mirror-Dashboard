import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DashboardContent } from "../../../components/faculty/Navbar";
import UpdateStudentForm from "../../../components/faculty/UpdateStudent";
import Loading from "../../../components/utilities/Loading";
import NotificationAlert from "../../../components/utilities/NotificationAlert";

export default function EditStudentDetails() {
  // Page Authentication Checker
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

  // Read params using next-router
  const router = useRouter();
  const [formComp, setFormComp] = useState();
  const [notification, setNotification] = useState({
    type: null,
    message: null,
  });

  // aixos call to get student details
  useEffect(() => {
    const { id } = router.query;
    axios
      .get(
        `${process.env.NEXT_PUBLIC_STRAPI_API}/info/students/view-one?id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        //   if res.data is empty
        if (Object.keys(res.data).length === 0) {
          setNotification({
            type: "error",
            message: "Student not found",
          });
          setFormComp(
            <h1 className="font-xl p-3 text-error">No Record Found</h1>
          );
        } else {
          setFormComp(<UpdateStudentForm studentData={res.data} />);
        }
      })
      .catch((err) => {
        console.log(err);
        setNotification({
          message: `${err.name}: ${err.message}`,
          type: "error",
          id: new Date(),
        });
      });
  }, []);

  return (
    <DashboardContent>
      {formComp}
      <NotificationAlert
        type={notification.type}
        message={notification.message}
        id={notification.id}
      />
    </DashboardContent>
  );
}
