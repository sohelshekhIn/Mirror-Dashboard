import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import AttendanceTable from "../../components/faculty/TakeAttendance";
import Image from "next/image";
import Loading from "../../components/utilities/Loading";
import PageNotFound from "../404";
import { search } from "../../public/images";
import { DashboardContent } from "../../components/faculty/Navbar";
import NotificationAlert from "../../components/utilities/NotificationAlert";

export default function TakeAttendance() {
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
    !data.user.facultyData["facultyRoles"].includes(11)
  ) {
    return <PageNotFound />;
  }
  const [batch, setBatch] = useState(["Loading Batches..."]);
  const [attendanceView, setAttendanceView] = useState(<EmptyMessage />);
  const [notification, setNotification] = useState({
    message: null,
    type: null,
  });

  useEffect(() => {
    axios
      .get(
        process.env.NEXT_PUBLIC_STRAPI_API +
          "/batches?fields[0]=batch&fields[1]=subjects",
        {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        }
      )
      .then((res) => {
        // let tempBatch = {};
        let tempBatch = [];
        for (let key in res.data.data) {
          if (
            data.user.facultyData["allowedBatches"].includes(
              res.data.data[key].attributes.batch
            ) ||
            data.user.facultyData["allowedBatches"] === "*"
          ) {
            tempBatch.push(res.data.data[key].attributes.batch);
          }
          //  ==> Temp Batch Object
          // tempBatch[res.data.data[key].attributes.batch] =
          //   res.data.data[key].attributes.subjects;
        }
        // Priority Changed to Admin Panel: Dismissing for now
        // tempBatch structure:
        // {
        //   "12 NCERT": ["Chemistry", "Physics", "Maths", "Biology"],
        // }
        setBatch(tempBatch);
      })
      .catch((err) => {
        // if (err.code && err.code === "ERR_BAD_REQUEST") {

        // }
        setNotification({
          message: err.message,
          type: "error",
          id: new Date(),
        });
        console.log(err);
      });
  }, [data]);

  const handleLoadStudents = (e) => {
    e.preventDefault();
    let batch = document.getElementById("selectBatch").value;
    if (batch === "DEFAULT") {
      return;
    }

    // Get students of batch for attendance
    axios
      .get(
        process.env.NEXT_PUBLIC_STRAPI_API +
          "/info/attendance/students?batch=" +
          batch,
        {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        }
      )
      .then((res) => {
        setAttendanceView(
          <AttendanceTable
            batch={batch}
            apiData={res.data}
            sessionData={data}
          />
        );
      })
      .catch((err) => {
        console.log(err);
        setNotification({
          message: err.message,
          type: "error",
          id: new Date(),
        });
      });
  };

  return (
    <DashboardContent>
      <div className="flex flex-col lg:flex-row w-full lg:space-x-24">
        <div className="flex flex-col lg:w-1/2">
          <div className="flex flex-col">
            <h1 className="heading1 text-primary">Take Attendance</h1>
            <span className="underline w-24 my-4"></span>
          </div>
          <form
            onSubmit={handleLoadStudents}
            className="w-full mt-14 flex flex-col md:flex-row"
          >
            <div className="form-control mx-auto md:mx-0 w-full max-w-xs">
              <label className="label">
                <span className="label-text">Select Batch</span>
              </label>
              <select
                id="selectBatch"
                defaultValue="DEFAULT"
                required
                className="select select-bordered"
              >
                <option value="DEFAULT" disabled>
                  Select Batch
                </option>
                {batch.map((batch) => {
                  if (batch === "Loading Batches...") {
                    return (
                      <option disabled value={batch}>
                        {batch}
                      </option>
                    );
                  }
                  return (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-control w-full md:w-36 mx-auto md:mx-5 max-w-xs flex justify-end my-5 md:my-0 ">
              <button type="submit" className="btn btn-accent">
                Proceed
              </button>
            </div>
          </form>
        </div>
        <div className="mt-10 lg:mt-0 min-w-fit lg:w-1/2">{attendanceView}</div>
      </div>
      <NotificationAlert
        message={notification.message}
        type={notification.type}
        id={notification.id}
      />
    </DashboardContent>
  );
}

const EmptyMessage = () => {
  return (
    <div className="flex flex-col items-center w-96 mt-16 bg-base-100 p-10 rounded-lg ">
      <span className="w-7/12">
        <Image src={search} />
      </span>
      <span className="text-secondary text-2xl font-bold">
        Select batch to continue
      </span>
    </div>
  );
};
