import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NotificationAlert from "../utilities/NotificationAlert";

const AttendanceTable = ({ apiData, batch, sessionData }) => {
  const [attendanceMethod, setAttendanceMethod] = useState(false); //true for marking absents, false for marking presents
  const [studentTable, setStudentTable] = useState([]); //true for student table, false for attendance table
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceState, setAttendanceState] = useState({});
  const [notification, setNotification] = useState({ message: "", type: "" });
  const router = useRouter();

  useEffect(() => {
    let studentDataComp = [];
    for (let key in apiData) {
      studentDataComp.push(
        <div key={key} className="flex shadow-sm py-2">
          <div className="form-control w-full">
            <label className="label cursor-pointer text-lg font-semibold">
              <span className="flex space-x-8">
                <span>{parseInt(key) + 1}</span>
                <span>{apiData[key].name}</span>
              </span>
              <input
                id={apiData[key].UserID}
                onChange={handleChange}
                name={apiData[key].UserID}
                type="checkbox"
                className="checkbox attendance"
              />
            </label>
          </div>
        </div>
      );
    }
    setStudentTable(studentDataComp);
  }, [apiData]);

  // on load of page, check if attendance has been taken for the batch
  useEffect(() => {
    axios
      .get(
        process.env.NEXT_PUBLIC_STRAPI_API + "/attendance/check?batch=" + batch,
        {
          headers: {
            Authorization: `Bearer ${sessionData.user.accessToken}`,
          },
        }
      )
      .then((res) => {
        if (res.data && res.data.found === undefined) {
          setAttendanceState(res.data[0]);
          updateAttendanceTable(res.data[0]);
        } else {
          setAttendanceState(null);
          // set checked to false which are having class attendance
          let checkboxes = document.getElementsByClassName("attendance");
          for (let i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = false;
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [batch, apiData]);

  const updateAttendanceTable = (attendanceData) => {
    setAttendanceMethod(attendanceData.attendanceMethod);
    document.getElementById("attendanceMethod").checked =
      attendanceData.attendanceMethod;
    for (let key in attendanceData.data) {
      document.getElementById(attendanceData.data[key]).checked = true;
    }
  };

  const handleAttendanceMethod = () => {
    setAttendanceMethod(!attendanceMethod);
  };

  let tempAttendanceData = [];
  const handleChange = (e) => {
    if (e.target.checked) {
      tempAttendanceData.push(e.target.name);
    } else if (e.target.checked === false) {
      tempAttendanceData.splice(tempAttendanceData.indexOf(e.target.name), 1);
    }
    setAttendanceData(tempAttendanceData);
    console.log(tempAttendanceData);
  };

  const handleAttendanceSubmission = () => {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, "0");
    let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    let yyyy = today.getFullYear();
    today = dd + "/" + mm + "/" + yyyy;

    // if attendance has been taken, update the attendance
    if (attendanceState) {
      axios
        .put(
          process.env.NEXT_PUBLIC_STRAPI_API +
            "/attendances/" +
            attendanceState.id,
          {
            data: {
              AttendanceId: batch.replace(/\s/g, "") + "_" + today,
              attendanceMethod: attendanceMethod,
              data: attendanceData,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${sessionData.user.accessToken}`,
            },
          }
        )
        .then((res) => {
          setNotification({
            message: "Attendance updated successfully",
            type: "success",
          });
          router.reload();
        })
        .catch((err) => {
          console.log(err);
          setNotification({
            message: "Error updating attendance",
            type: "error",
          });
        });
    } else {
      axios
        .post(
          process.env.NEXT_PUBLIC_STRAPI_API + "/attendances",
          {
            data: {
              AttendanceId: batch.replace(/\s/g, "") + "_" + today,
              attendanceMethod: attendanceMethod,
              data: attendanceData,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${sessionData.user.accessToken}`,
            },
          }
        )
        .then((res) => {
          setNotification({
            message: "Attendance submitted successfully",
            type: "success",
          });
          router.reload();
        })
        .catch((err) => {
          console.log(err);
          setNotification({
            message: "Error submitting attendance",
            type: "error",
          });
        });
    }
  };
  return (
    <div className="flex flex-col mt-10 px-4 py-8 rounded-xl bg-white shadow-xl max-h-[60vh] overflow-y-scroll">
      <div className="flex flex-row justify-between align-bottom">
        <h1 className="font-bold text-3xl">12 CBSE</h1>
      </div>
      <div className="flex w-full">
        <div className="form-control w-full">
          <label className="label cursor-pointer">
            <span className="label-text">Mark Presentees</span>
            <input
              type="checkbox"
              id="attendanceMethod"
              onChange={handleAttendanceMethod}
              className="toggle"
            />
          </label>
        </div>
      </div>
      <div className="flex flex-col space-y-5 mt-14 text-gray-600">
        <div className="flex justify-between font-semibold  text-base">
          <span className="flex space-x-8">
            <h1>Sr.</h1>
            <h1>Name</h1>
          </span>
          <h1> {attendanceMethod ? "Present" : "Absent"}</h1>
        </div>
        {studentTable}
        <div className="flex space-x-5 justify-end pt-5">
          <button className="btn btn-ghost">Cancel</button>
          <button
            onClick={handleAttendanceSubmission}
            className="btn btn-accent"
          >
            Submit
          </button>
        </div>
      </div>
      <NotificationAlert
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
};

export default AttendanceTable;
