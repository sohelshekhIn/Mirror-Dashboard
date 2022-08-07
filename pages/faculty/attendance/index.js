import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import AttendanceTable from "../../../components/faculty/TakeAttendance";
import Image from "next/image";
import Loading from "../../../components/utilities/Loading";
import PageNotFound from "../../404";
import { search } from "../../../public/images";
import { DashboardContent } from "../../../components/faculty/Navbar";
import NotificationAlert from "../../../components/utilities/NotificationAlert";

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
  var classes = [];
  var batches = [];
  const [formData, setFormData] = useState({
    batch: null,
    class: null,
  });

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
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoadStudents = (e) => {
    e.preventDefault();
    let batch = document.getElementById("selectBatch").value;
    if (formData.batch === "DEFAULT" || formData.class === "DEFAULT") {
      return;
    }

    // Get students of batch for attendance
    axios
      .get(
        process.env.NEXT_PUBLIC_STRAPI_API +
          "/info/attendance/students?batch=" +
          formData.batch,
        {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        }
      )
      .then((res) => {
        setAttendanceView(
          <AttendanceTable
            batch={formData.batch}
            apiData={res.data}
            sessionData={data}
            setNotification={setNotification}
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
      <div className="flex flex-col  w-full">
        <div className="flex flex-col lg:w-8/12">
          <div className="flex flex-col">
            <h1 className="heading1 text-primary">Take Attendance</h1>
            <span className="underline w-24 my-4"></span>
          </div>
          <form
            onSubmit={handleLoadStudents}
            className="w-full mt-10 flex flex-col space-y-5"
          >
            <div className="space-x-0 space-y-5 md:space-y-0 md:space-x-5 flex flex-col md:flex-row">
              <div className="form-control mx-auto md:mx-0 w-full max-w-lg">
                <label className="label">
                  <span className="label-text">Select Class</span>
                </label>
                <select
                  id="selectBatch"
                  defaultValue="DEFAULT"
                  accessKey="Q"
                  required
                  onChange={handleChange}
                  value={formData.class}
                  name="class"
                  className="select select-bordered"
                >
                  <option accessKey="Q" value="DEFAULT" disabled>
                    Select Class
                  </option>
                  {Object.keys(batch).map((key) => {
                    if (key === "Loading Batches...") {
                      return (
                        <option disabled value="Loading">
                          Loading Batches...
                        </option>
                      );
                    }
                    classes.push(batch[key].split(" ")[0]);
                  })}
                  {(classes = [...new Set(classes)])}
                  {classes.map((classsNo) => {
                    return (
                      <option key={classsNo} value={classsNo}>
                        {classsNo}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="form-control mx-auto md:mx-0 w-full max-w-lg">
                <label className="label">
                  <span className="label-text">Select Batch</span>
                </label>
                <select
                  id="selectBatch"
                  defaultValue="DEFAULT"
                  required
                  onChange={handleChange}
                  value={formData.batch}
                  name="batch"
                  className="select select-bordered"
                >
                  {formData.class === "DEFAULT" ||
                  formData.class === "" ||
                  formData.class === null ? (
                    <option disabled value="DEFAULT">
                      Select Class First
                    </option>
                  ) : (
                    <option disabled value="DEFAULT">
                      Select Batch
                    </option>
                  )}
                  {Object.keys(batch).map((key) => {
                    if (batch[key].includes(formData.class)) {
                      batches.push(key);
                      return (
                        <option key={batch[key]} value={batch[key]}>
                          {batch[key]}
                        </option>
                      );
                    }
                  })}
                </select>
              </div>
            </div>
            <div className="form-control w-full md:w-36 max-w-lg">
              <button type="submit" accessKey="S" className="btn btn-accent">
                Proceed
              </button>
            </div>
          </form>
        </div>
        <div className="mt-10 min-w-fit lg:w-8/12">{attendanceView}</div>
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
