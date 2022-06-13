import Image from "next/image";
import { useEffect, useState } from "react";
import NotificationAlert from "../utilities/NotificationAlert";

export default function StudentTableView({ requestData, studentsData }) {
  const [studentTableViewColumns, setStudentTableViewColumns] = useState({
    1: {
      fieldName: "name",
      label: "Name",
      isSortable: true,
    },
    2: {
      fieldName: "fatherName",
      label: "Father Name",
      isSortable: true,
    },
    3: {
      fieldName: "motherName",
      label: "Mother Name",
      isSortable: true,
    },
    4: {
      fieldName: "fatherMobile",
      label: "Father Mobile",
    },
    5: {
      fieldName: "motherMobile",
      label: "Mother Mobile",
    },
  });
  const [tableHeaders, setTableHeaders] = useState([]);
  const [tableStudentData, setTableStudentData] = useState([]);
  var subjectList = [];

  // check if localStorage has studentTableViewColumns
  if (localStorage.getItem("studentTableViewColumns")) {
    setStudentTableViewColumns(
      JSON.parse(localStorage.getItem("studentTableViewColumns"))
    );
  }

  useEffect(() => {
    // map studentTableViewColumns to tableHeaders
    let tableHeaders = [];
    if (studentsData.length > 0) {
      for (let key in studentTableViewColumns) {
        // tableHeaders.push(<h1>{studentTableViewColumns[key].label}</h1>);
        tableHeaders.push(
          <th className="studentTableTh">
            {studentTableViewColumns[key].label}
          </th>
        );
      }
      setTableHeaders(tableHeaders);
    } else {
      setTableHeaders([
        <div className="flex flex-col text-lg font-semibold text-error">
          No Records Found
        </div>,
      ]);
    }
    // map studentsData to tableStudentData
    let tableStudentData = [];
    let tableStudentRow = [];
    let count = 1;
    // if (studentsData) {
    for (let i = 0; i < studentsData.length; i++) {
      for (let j = 0; j < Object.keys(studentTableViewColumns).length; j++) {
        tableStudentData.push(
          <th className="studentTableTh">
            {studentsData[i][studentTableViewColumns[j + 1].fieldName]}
          </th>
        );
      }
      tableStudentRow.push(
        <tr>
          <th className="studentTableTh">{count}</th>
          {tableStudentData}
        </tr>
      );
      count++;
      tableStudentData = [];
    }
    setTableStudentData(tableStudentRow);
  }, [requestData, studentsData]);
  console.log(requestData.subjects);
  return (
    <div className="flex flex-col mt-10 px-4 py-10 rounded-xl bg-white shadow-xl">
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-center pl-3">
          {requestData.batch === "DEFAULT" || requestData.batch === null ? (
            <h1 className="font-bold text-3xl">Class {requestData.class}</h1>
          ) : (
            <h1 className="font-bold text-3xl">{requestData.batch}</h1>
          )}
          <div class="dropdown dropdown-left">
            <label tabindex="0" class="btn btn-ghost">
              <span className=" flex flex-col space-y-1">
                <span className="w-1 h-1 bg-black rounded-full"></span>
                <span className="w-1 h-1 bg-black rounded-full"></span>
                <span className="w-1 h-1 bg-black rounded-full"></span>
              </span>
            </label>
            <ul
              tabindex="0"
              class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a>Item 1</a>
              </li>
              <li>
                <a>Item 2</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-row flex-wrap space-x-5 items-center">
          {/* map through requestData.subjects */}
          {requestData.subjects.map((subject) =>
            subjectList.push(
              <span>
                <span className="seperatingDots"></span>
                <p>{subject}</p>
              </span>
            )
          )}
          {subjectList}
          {/* <span className="seperatingDots"></span>
          <p>Maths</p>
          <span className="seperatingDots"></span>
          <p>Physics</p>
          <span className="seperatingDots"></span>
          <p>Chemistry</p> */}
        </div>
      </div>
      <div className="flex flex-col space-y-5">
        <div class="overflow-x-auto mt-14">
          <table class="table w-full">
            <thead>
              <tr>
                <th className="studentTableTh"></th>
                {tableHeaders}
              </tr>
            </thead>
            <tbody>{tableStudentData}</tbody>
          </table>
        </div>
        {/* <div className="flex flex-col space-y-5 mt-14 text-gray-600 overflow-x-auto">
          <div className="flex justify-between font-semibold  text-base">
            <span className="flex space-x-8">{tableHeaders}</span>
            <h1></h1>
          </div>
          <div className="flex shadow-sm py-2">
            <div className="w-full label text-md font-semibold">
              <input name="" type="checkbox" className="checkbox hidden" />
              <span className="flex space-x-8 w-full">
                <span>Sohel Shekh</span>
                <span>Alam Shekh</span>
                <span>Momtaj Shekh</span>
                <span>9427381130</span>
                <span>8866081130</span>
              </span>
            </div>
          </div>
        </div> */}
      </div>
      {/* <NotificationAlert
        message={notification.message}
        type={notification.type}
      /> */}
    </div>
  );
}
