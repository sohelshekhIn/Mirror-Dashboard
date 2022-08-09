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
  {
    /* 
Checks if user has permission to view this page
Refer components > Faculty > Navbar.js > moduleLinks{...}
*/
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
  const [testTableRows, setTestTableRows] = useState([]);

  useEffect(() => {
    let testAllowId = data.user.id;
    if (data.user.facultyData["testsViewMode"] === "*") {
      testAllowId = "*";
    }
    axios
      .post(
        process.env.NEXT_PUBLIC_STRAPI_API + "/info/tests",
        {
          data: {
            id: testAllowId,
          },
        },
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
      if (tests.length === 0) {
        setTestTableRows(<EmptyMessage />);
        return;
      }

      for (let i = 0; i < tests.length; i++) {
        let testTitle = tests[i].data.testTitle;
        let [batch, subject, date] = tests[i].TestId.split("_");
        // converts "12NCERT" to "12 NCERT" and "9BVB" to "9 BVB"
        if (isNaN(parseInt(batch[1]))) {
          batch = batch.slice(0, 1) + " " + batch.slice(1);
        } else if (isNaN(parseInt(batch[2]))) {
          batch = batch.slice(0, 2) + " " + batch.slice(2);
        }
        let addedBy = tests[i].data.addedBy[1];
        testCardComp.push(
          <tr>
            <td className="studentTableTh">{i + 1}</td>
            <td className="studentTableTh">{date}</td>
            <td className="studentTableTh">{batch}</td>
            <td className="studentTableTh">{subject}</td>
            <td className="studentTableTh">{testTitle}</td>
            {data.user.facultyData["testsViewMode"] === "*" ? (
              <td className="studentTableTh">{addedBy}</td>
            ) : (
              ""
            )}
            {/* 
Checks if user has permission to edit test
Refer components > Faculty > Navbar.js > moduleLinks{...}
*/}
            {data.user.facultyData["facultyRoles"].includes(19) ? (
              <td className="studentTableTh">
                <Link
                  href={`/faculty/manage-tests/edit-details?id=${tests[i].id}`}
                >
                  <a className="btn btn-modal">Edit</a>
                </Link>
              </td>
            ) : (
              ""
            )}
          </tr>
        );
      }
      setTestTableRows(testCardComp);
    }
  }, [tests]);

  return (
    <DashboardContent>
      <div className="flex flex-col">
        <div className="flex flex-col">
          <h1 className="heading1 text-primary">Manage Tests</h1>
          <span className="underline w-24 my-4"></span>
        </div>
        <div className="flex flex-col max-w-6xl space-y-5 ">
          {/* 
Checks if user has permission to add new test
Refer components > Faculty > Navbar.js > moduleLinks{...}
*/}
          {data.user.facultyData["facultyRoles"].includes(18) ? (
            <div className="flex justify-end">
              <Link href="/faculty/manage-tests/new-test">
                <a accessKey="A" className="btn btn-accent">
                  Add new Test
                </a>
              </Link>
            </div>
          ) : (
            <div className="flex justify-end"></div>
          )}
          <div className="overflow-x-auto py-5 px-2 lg:py-8 lg:px-5 rounded-xl shadow-lg bg-white">
            <table className="table w-full">
              <thead>
                <tr>
                  <td className="studentTableTh">Sr.</td>
                  <th className="studentTableTh">Date</th>
                  <th className="studentTableTh">Batch</th>
                  <th className="studentTableTh">Subject</th>
                  <th className="studentTableTh">Title</th>
                  {data.user.facultyData["testsViewMode"] === "*" ? (
                    <th className="studentTableTh">Added By</th>
                  ) : (
                    ""
                  )}
                  {/* 
Checks if user has permission to edit test
Refer components > Faculty > Navbar.js > moduleLinks{...}
*/}
                  {data.user.facultyData["facultyRoles"].includes(19) ? (
                    <th className="studentTableTh"></th>
                  ) : (
                    ""
                  )}
                </tr>
              </thead>
              <tbody>{testTableRows}</tbody>
            </table>
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

const EmptyMessage = () => {
  return (
    <div className="flex flex-col space-y-10 items-center w-96 mt-16 bg-base-100 p-10 rounded-lg ">
      <span className="w-7/12">
        <Image src={search} />
      </span>
      <span className="text-secondary text-2xl font-bold text-center">
        Add test to view <br />
      </span>
    </div>
  );
};
