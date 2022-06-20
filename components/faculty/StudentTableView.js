import Link from "next/link";
import { useEffect, useState } from "react";

export default function StudentTableView({
  session,
  requestData,
  studentsData,
}) {
  const [studentTableViewColumns, setStudentTableViewColumns] = useState({
    0: {
      // setting area
      tableCompact: false,
    },
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
  const [subjectList, setSubjectList] = useState([]);
  // check if localStorage has studentTableViewColumns
  // if (localStorage.getItem("studentTableViewColumns")) {
  //   setStudentTableViewColumns(
  //     JSON.parse(localStorage.getItem("studentTableViewColumns"))
  //   );
  // }

  useEffect(() => {
    // map studentTableViewColumns to tableHeaders
    let tableHeaders = [];
    if (studentsData.length > 0) {
      for (let key in studentTableViewColumns) {
        if (key !== 0) {
          // tableHeaders.push(<h1>{studentTableViewColumns[key].label}</h1>);
          tableHeaders.push(
            <th className="studentTableTh">
              {studentTableViewColumns[key].label}
            </th>
          );
        }
      }
      setTableHeaders(tableHeaders);
    } else {
      setTableHeaders([
        <div className="flex flex-col px-5 text-lg font-semibold text-error">
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
        if (j !== 0) {
          tableStudentData.push(
            <td className="studentTableTh">
              {studentsData[i][studentTableViewColumns[j].fieldName]}
            </td>
          );
          if (session.user.facultyData["facultyRoles"].includes(57)) {
            if (Object.keys(studentTableViewColumns).length - 1 === j) {
              tableStudentData.push(
                <td className="studentTableTh">
                  <Link
                    href={`/faculty/view-students/edit-details?id=${studentsData[i].UserID}`}
                  >
                    <a className="btn modal-button">Edit</a>
                  </Link>
                </td>
              );
            }
          }
        }
      }
      tableStudentRow.push(
        <tr>
          <td className="studentTableTh">{count}</td>
          {tableStudentData}
        </tr>
      );
      count++;
      tableStudentData = [];
    }
    setTableStudentData(tableStudentRow);

    let tempSubjectList = [];
    requestData.subjects.map((subject) =>
      tempSubjectList.push(
        <span className="flex space-x-5 subjectShowDiv items-center">
          <span className="seperatingDots"></span>
          <p>{subject}</p>
        </span>
      )
    );
    setSubjectList(tempSubjectList);
  }, [requestData, studentsData]);

  return (
    <div className="flex flex-col mt-10 px-4 py-10 rounded-xl bg-white shadow-xl">
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-center pl-3">
          {requestData.batch === "DEFAULT" || requestData.batch === null ? (
            <h1 className="font-bold text-3xl">Class {requestData.class}</h1>
          ) : (
            <h1 className="font-bold text-3xl">{requestData.batch}</h1>
          )}
          <div className="dropdown dropdown-left">
            <label tabindex="0" className="btn btn-ghost">
              <span className=" flex flex-col space-y-1">
                <span className="w-1 h-1 bg-black rounded-full"></span>
                <span className="w-1 h-1 bg-black rounded-full"></span>
                <span className="w-1 h-1 bg-black rounded-full"></span>
              </span>
            </label>
            <ul
              tabindex="0"
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <div className="w-full">
                  <label className="label cursor-pointer w-full flex justify-between">
                    <span className="label-text">Compact View</span>
                    <input
                      type="checkbox"
                      onChange={() => {
                        setStudentTableViewColumns({
                          ...studentTableViewColumns,
                          0: {
                            tableCompact:
                              !studentTableViewColumns[0].tableCompact,
                          },
                        });
                      }}
                      className="checkbox"
                    />
                  </label>
                </div>
              </li>
              <li>
                <a>Item 2</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-row flex-wrap space-x-5 items-center">
          {subjectList}
        </div>
      </div>
      <div className="flex flex-col space-y-5">
        <div className="overflow-x-auto mt-14">
          <table
            className={
              studentTableViewColumns[0].tableCompact
                ? "table w-full table-compact"
                : "table w-full"
            }
          >
            <thead>
              <tr>
                {tableHeaders}
                <th className="studentTableTh"></th>
              </tr>
            </thead>
            <tbody>{tableStudentData}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
