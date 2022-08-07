import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const AttendanceTable = ({ apiData, batch, sessionData, setNotification }) => {
  const [attendanceMethod, setAttendanceMethod] = useState(false); //true for marking absents, false for marking presents
  const [studentTable, setStudentTable] = useState([]); //true for student table, false for attendance table
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceState, setAttendanceState] = useState({});
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
    // get all checkbox with attendance class
    let checkboxes = document.getElementsByClassName("attendance");
    // uncheck all checkboxes
    for (let i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = false;
    }

    axios
      .get(
        process.env.NEXT_PUBLIC_STRAPI_API +
          "/info/attendance/check?batch=" +
          batch,
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
          document.getElementById("attendance").checked = false;
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

    // if attendanceMethod is true then generate present students
    if (attendanceData.attendanceMethod) {
      let presentStudents = [];
      // attendanceData here holds the students who are absent

      // get present students from apiData - attendanceData
      for (let key in apiData) {
        if (!attendanceData.data.includes(apiData[key].UserID)) {
          presentStudents.push(apiData[key]);
        }
      }
      console.log(presentStudents);
      for (let key in presentStudents) {
        document.getElementById(presentStudents[key].UserID).checked = true;
      }
    } else {
      for (let key in attendanceData.data) {
        document.getElementById(attendanceData.data[key]).checked = true;
      }
    }
  };

  const handleAttendanceMethod = () => {
    setAttendanceMethod(!attendanceMethod);
    // invert all checkboxes with class attendance
    let checkboxes = document.getElementsByClassName("attendance");
    for (let i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = !checkboxes[i].checked;
    }
  };

  let tempAttendanceData = [];
  const handleChange = (e) => {
    if (e.target.checked) {
      tempAttendanceData.push(e.target.name);
    } else if (e.target.checked === false) {
      tempAttendanceData.splice(tempAttendanceData.indexOf(e.target.name), 1);
    }
    setAttendanceData(tempAttendanceData);
  };

  const handleAttendanceSubmission = () => {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, "0");
    let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    let yyyy = today.getFullYear();
    today = dd + "/" + mm + "/" + yyyy;
    let apiAttendanceData = attendanceData;

    if (attendanceMethod) {
      let absentStudents = [];
      for (let key in apiData) {
        if (!apiAttendanceData.includes(apiData[key].UserID)) {
          absentStudents.push(apiData[key].UserID);
        }
      }
      apiAttendanceData = absentStudents;
    }

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
              data: apiAttendanceData,
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
          setTimeout(() => router.reload(), 2000);
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
              data: apiAttendanceData,
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
          setTimeout(() => router.reload(), 2000);
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
    <div className="flex flex-col px-4 py-10 rounded-xl bg-white shadow-xl">
      <div className="flex flex-row space-x-4 align-bottom">
        <h1 className="font-bold text-3xl">{batch}</h1>
        {attendanceState === null ? (
          ""
        ) : (
          <p className="font-semibold text-success pt-3">(Taken)</p>
        )}
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
          <button tabIndex="-1" className="btn btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleAttendanceSubmission}
            className="btn btn-accent"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;
