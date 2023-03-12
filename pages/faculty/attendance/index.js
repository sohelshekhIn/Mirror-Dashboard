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
  const [batchResponseData, setBatchResponseData] = useState([]);
  const [formData, setFormData] = useState({
    batch: null,
    class: null,
  });
  const [currentBatches, setCurrentBatches] = useState([]);

  const [attendanceView, setAttendanceView] = useState(<EmptyMessage />);
  const [notification, setNotification] = useState({
    message: null,
    type: null,
  });

  useEffect(() => {
    if (
      formData.batch !== null &&
      formData.batch.split(" ")[0] !== formData.class
    ) {
      formData.batch = "DEFAULT";
    }
  }, [formData]);

  useEffect(() => {
    axios
      .get(
        process.env.NEXT_PUBLIC_STRAPI_API +
          "/batches?fields[0]=batch&fields[1]=subjects&fields[2]=timings",
        {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        }
      )
      .then((res) => {
        setBatchResponseData(res.data.data);
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

  const handleLoadStudents = (e, from = "form", batch) => {
    if (from === "form") {
      e.preventDefault();
      let batch = document.getElementById("selectBatch").value;
      console.log(batch);
      if (
        formData.batch === "DEFAULT" ||
        batch === "DEFAULT" ||
        formData.batch === null ||
        batch === null ||
        formData.class === "DEFAULT"
      ) {
        setNotification({
          message: "Please select a batch and class",
          type: "error",
          id: new Date(),
        });
        setAttendanceView(<EmptyMessage />);
        return;
      }
    } else {
      setFormData({ class: batch.split(" ")[0], batch });
    }
    // Get students of batch for attendance
    let batchToBeLoaded = batch ? batch : formData.batch;
    axios
      .get(
        process.env.NEXT_PUBLIC_STRAPI_API +
          "/info/attendance/students?batch=" +
          batchToBeLoaded,
        {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        }
      )
      .then((res) => {
        if (res.data.length === 0) {
          setNotification({
            message: "No students found",
            type: "error",
            id: new Date(),
          });
          setAttendanceView(<EmptyMessage />);
          return;
        }
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

  const checkForCurrentBatch = () => {
    let tempCurrentBatches = [];
    // for every batch in batchResponseData get timings and check if current time is between start and end time
    for (let key in batchResponseData) {
      let batch = batchResponseData[key].attributes;
      let timings = batch.timings;
      let currentTimeHr = new Date().getHours();
      let currentTimeMin = new Date().getMinutes();
      // if there is 0 in front of single digit minutes, remove it
      if (currentTimeMin.toString().length === 1) {
        currentTimeMin = currentTimeMin.toString().replace("0", "");
      }
      // check if current time is between start and end time
      if (timings != null && currentTimeHr >= timings[0].split(":")[0]) {
        if (
          (currentTimeHr === timings[1].split(":")[0] &&
            currentTimeMin < timings[1].split(":")[1]) ||
          currentTimeHr < timings[1].split(":")[0]
        ) {
          tempCurrentBatches.push({
            batch: batchResponseData[key].attributes.batch,
            timing: timings,
          });
        }
      }
    }
    setCurrentBatches(tempCurrentBatches);
  };

  useEffect(() => {
    if (batchResponseData.length !== 0) {
      checkForCurrentBatch();
      setInterval(() => {
        checkForCurrentBatch();
      }, 300000);
    }
  }, [batchResponseData]);

  return (
    <DashboardContent>
      <div className="flex flex-col lg:justify-between lg:flex-row space-x-0 space-y-5 lg:space-y-0 lg:space-x-5">
        <div className="flex flex-col w-full lg:w-6/12">
          <div className="flex flex-col lg:w-full">
            <div className="flex flex-col">
              <h1 className="heading1 text-primary">Take Attendance</h1>
              <span className="underline w-24 my-4"></span>
            </div>
            <form
              onSubmit={handleLoadStudents}
              className="w-full mt-10 flex flex-col space-y-5"
            >
              <div className="space-x-0 space-y-5 xl:space-y-0 xl:space-x-5 flex flex-col xl:flex-row">
                <div className="form-control mx-auto md:mx-0 w-full max-w-lg">
                  <label className="label">
                    <span className="label-text">Select Class</span>
                  </label>
                  <select
                    id="selectClass"
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
                      let tempBatch = batch[key].split("_")[0];
                      if (parseInt(tempBatch).toString().length == 1) {
                        tempBatch =
                          tempBatch.slice(0, 1) + " " + tempBatch.slice(1);
                      } else {
                        tempBatch =
                          tempBatch.slice(0, 2) + " " + tempBatch.slice(2);
                      }
                      tempBatch.split(" ")[0];
                      if (tempBatch.split(" ")[0] === formData.class) {
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
                <button
                  type="submit"
                  accessKey="S"
                  className="btn btn-secondary"
                >
                  Proceed
                </button>
              </div>
            </form>
          </div>
          <div className="mt-10 min-w-fit lg:w-full">{attendanceView}</div>
        </div>
        <div className="mt-36 w-full lg:w-5/12 xl:w-4/12 2xl:w-3/12">
          <div className="flex flex-col">
            <h1 className="heading1 text-primary">Pending Attendence</h1>
            <span className="underline w-24 my-4"></span>
          </div>
          <div className="bg-white font-medium p-4 my-4 rounded-xl shadow-md flex flex-col divide-y duration-75">
            {/* loop through currentBactes */}
            {currentBatches.map((batch) => {
              // convert batch timing into 12 hour format
              batch.timing = batch.timing.map((time) => {
                let timeSplit = time.split(":");
                let hour = parseInt(timeSplit[0]);
                let minute = timeSplit[1];
                if (hour > 12) {
                  hour = hour - 12;
                }
                return hour + ":" + minute;
              });

              return (
                <button
                  key={batch.batch}
                  onClick={() => {
                    handleLoadStudents(null, "reminder", batch.batch);
                  }}
                  className="cursor-pointer w-full flex justify-around p-3 py-4 hover:bg-accent rounded-md"
                >
                  <div className="w-full">
                    <p>{batch.batch}</p>
                  </div>
                  <div className="w-full">
                    <p>{batch.timing.join(" - ")}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
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
    <div className="lg:flex hidden flex-col items-center w-96 mt-16 bg-base-100 p-10 rounded-lg ">
      <span className="w-7/12">
        <Image src={search} />
      </span>
      <span className="text-neutral text-2xl font-bold">
        Select batch to continue
      </span>
    </div>
  );
};
