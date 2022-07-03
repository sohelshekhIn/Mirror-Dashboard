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

export default function ManageSubmissions() {
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
    !data.user.facultyData["facultyRoles"].includes(16)
  ) {
    return <PageNotFound />;
  }

  // === Main ===
  const [notification, setNotification] = useState({
    type: null,
    message: null,
  });
  const [submissions, setSubmissions] = useState();
  const [submissionTableRows, setSubmissionTableRows] = useState([]);
  useEffect(() => {
    let submissionAllowId = data.user.id;
    if (data.user.facultyData["submissionsViewMode"] === "*") {
      submissionAllowId = "*";
    }
    axios
      .post(
        process.env.NEXT_PUBLIC_STRAPI_API + "/info/submissions",
        {
          data: {
            id: submissionAllowId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        }
      )
      .then((res) => {
        setSubmissions(res.data);
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
    let submissionCardComp = [];
    if (submissions) {
      if (submissions.length === 0) {
        setSubmissionTableRows(<EmptyMessage />);
        return;
      }
      console.log(submissions);

      for (let i = 0; i < submissions.length; i++) {
        let submissionTitle = submissions[i].data.submissionTitle;
        let [batch, subject, date] = submissions[i].SubmissionId.split("_");
        // converts "12NCERT" to "12 NCERT" and "9BVB" to "9 BVB"
        if (isNaN(parseInt(batch[1]))) {
          batch = batch.slice(0, 1) + " " + batch.slice(1);
        } else if (isNaN(parseInt(batch[2]))) {
          batch = batch.slice(0, 2) + " " + batch.slice(2);
        }
        let addedBy = submissions[i].data.addedBy[1];
        submissionCardComp.push(
          <tr>
            <td className="studentTableTh">{i + 1}</td>
            <td className="studentTableTh">{date}</td>
            <td className="studentTableTh">{batch}</td>
            <td className="studentTableTh">{subject}</td>
            <td className="studentTableTh">{submissionTitle}</td>
            {data.user.facultyData["submissionViewMode"] === "*" ? (
              <td className="studentTableTh">{addedBy}</td>
            ) : (
              ""
            )}
            {/* 
Checks if user has permission to edit submission
Refer components > Faculty > Navbar.js > moduleLinks{...}
*/}
            {data.user.facultyData["facultyRoles"].includes(21) ? (
              <td className="studentTableTh">
                <Link
                  href={`/faculty/manage-submissions/edit-details/${submissions[i].id}`}
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
      setSubmissionTableRows(submissionCardComp);
    }
  }, [submissions]);

  return (
    <DashboardContent>
      <div className="flex flex-col">
        <div className="flex flex-col">
          <h1 className="heading1 text-primary">Manage Submissions</h1>
          <span className="underline w-24 my-4"></span>
        </div>
        <div className="flex flex-col max-w-6xl space-y-5 ">
          {/* 
Checks if user has permission to add new submissions
Refer components > Faculty > Navbar.js > moduleLinks{...}
*/}
          {data.user.facultyData["facultyRoles"].includes(20) ? (
            <div className="flex justify-end">
              <Link href="/faculty/manage-submissions/new-submission">
                <a accessKey="A" className="btn btn-accent">
                  Add new Submission
                </a>
              </Link>
            </div>
          ) : (
            <div className="flex justify-end"></div>
          )}

          <div class="overflow-x-auto py-5 px-2 lg:py-8 lg:px-5 rounded-xl shadow-lg bg-white">
            <table class="table w-full">
              <thead>
                <tr>
                  <td className="studentTableTh">Sr.</td>
                  <th className="studentTableTh">Date</th>
                  <th className="studentTableTh">Batch</th>
                  <th className="studentTableTh">Subject</th>
                  <th className="studentTableTh">Title</th>
                  {data.user.facultyData["submissionsViewMode"] === "*" ? (
                    <th className="studentTableTh">Added By</th>
                  ) : (
                    ""
                  )}
                  {/* 
Checks if user has permission to add new test
Refer components > Faculty > Navbar.js > moduleLinks{...}
*/}
                  {data.user.facultyData["facultyRoles"].includes(19) ? (
                    <th className="studentTableTh"></th>
                  ) : (
                    ""
                  )}
                </tr>
              </thead>
              <tbody>{submissionTableRows}</tbody>
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
        Add submission to view <br />
      </span>
    </div>
  );
};
