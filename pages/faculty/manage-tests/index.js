import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardContent } from "../../../components/faculty/Navbar";
import Loading from "../../../components/utilities/Loading";
import NotificationAlert from "../../../components/utilities/NotificationAlert";
import { search } from "../../../public/images";
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
  const [tests, setTests] = useState();
  const [testCardComp, setTestCardComp] = useState([]);

  useEffect(() => {
    axios
      .get(
        process.env.NEXT_PUBLIC_STRAPI_API + "/marks?pagination[pageSize]=10",
        {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        }
      )
      .then((res) => {
        setTests(res.data);
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

  useEffect(() => {
    let testCardComp = [];
    if (tests) {
      if (tests.data.length === 0) {
        setTestCardComp(<EmptyMessage />);
        return;
      }

      for (let i = 0; i < tests.data.length; i++) {
        console.log(tests.data[i]);
        let testTitle = tests.data[i].attributes.data.testTitle;
        let [batch, subject, date] = tests.data[i].attributes.TestId.split("_");
        // converts "12NCERT" to "12 NCERT" and "9BVB" to "9 BVB"
        if (isNaN(parseInt(batch[1]))) {
          batch = batch.slice(0, 1) + " " + batch.slice(1);
        } else if (isNaN(parseInt(batch[2]))) {
          batch = batch.slice(0, 2) + " " + batch.slice(2);
        }
        testCardComp.push(
          <div className="flex flex-col max-w-xl">
            <Link
              href={`/faculty/manage-tests/edit-details/${tests.data[i].id}`}
            >
              <a>
                <div className="flex flex-col lg:flex-row p-5 py-8 space-y-1 w-full bg-white rounded-xl shadow-xl hover:scale-105">
                  <div className="flex flex-row lg:flex-col w-full lg:w-2/12 justify-between lg:justify-center">
                    <p className="text-base">{date}</p>
                    <p className="text-base">{batch}</p>
                    <p className="text-base">{subject}</p>
                  </div>
                  <div className="divider divider-horizontal"></div>
                  <div className="flex flex-col w-9/12 justify-center">
                    <h1 className="font-medium text-secondary text-xl">
                      {testTitle}
                    </h1>
                  </div>
                </div>
              </a>
            </Link>
          </div>
        );
      }
      setTestCardComp(testCardComp);
    }
  }, [tests]);

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
          {testCardComp}
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

const EmptyMessage = () => {
  return (
    <div className="flex flex-col space-y-10 items-center w-96 mt-16 bg-base-100 p-10 rounded-lg ">
      <span className="w-7/12">
        <Image src={search} />
      </span>
      <span className="text-secondary text-2xl font-bold text-center">
        Add test to view <br />
        <span className="text-base ">(last 10 tests)</span>
      </span>
    </div>
  );
};
