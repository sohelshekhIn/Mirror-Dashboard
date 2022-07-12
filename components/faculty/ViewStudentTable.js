import Link from "next/link";
import { useState, useEffect, useMemo, useImperativeHandle } from "react";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import { dropDown } from "../../public/images";

export default function ViewStudentTable({ metaInfo, studentsData }) {
  console.log(metaInfo);
  console.log(studentsData);

  const [subjectList, setSubjectList] = useState([]);

  // table columns
  const tableColumns = [
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Father Name",
      accessor: "fatherName",
    },
    {
      Header: "Mother Name",
      accessor: "motherName",
    },
    {
      Header: "Father Mobile",
      accessor: "fatherMobile",
    },
    {
      Header: "Mother Mobile",
      accessor: "motherMobile",
    },
    {
      Header: "Date of Birth",
      accessor: "dob",
    },
    {
      Header: "School",
      accessor: "school",
    },
    {
      Header: "Join Date",
      accessor: "joinDate",
    },
    {
      Header: "Batch",
      accessor: "batch.batch",
    },
    {
      Header: "Can Login",
      accessor: "canLogin",
      // convert boolean to string
      Cell: ({ value }) => {
        return value ? "Yes" : "No";
      },
    },
    {
      Header: "Active",
      accessor: "blocked",
      // invret the value of blocked
      Cell: ({ value }) => {
        return value ? "No" : "Yes";
      },
    },
    {
      Header: "msgMobile",
      accessor: "msgMobile",
    },
    {
      Header: "Subjects",
      accessor: "subjects",
      Cell: ({ row }) => {
        return row.original.subjects
          .map((subject) => {
            return subject;
          })
          .join(", ");
      },
    },
    {
      Header: "",
      accessor: "UserID",
      Cell: ({ row }) => {
        return (
          <Link
            href={`/faculty/view-students/edit-details?id=${row.original.UserID}`}
          >
            <a className="btn modal-button">Edit</a>
          </Link>
        );
      },
    },
  ];

  const columns = useMemo(() => tableColumns, []);
  const data = useMemo(() => studentsData, [metaInfo, studentsData]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { globalFilter, pageIndex } = state;

  useEffect(() => {
    // If subjects are selected, then render element to show subjects selected
    let tempSubjectList = [];
    metaInfo.subjects.map((subject) =>
      tempSubjectList.push(
        <span className="flex space-x-5 subjectShowDiv items-center">
          <span className="seperatingDots"></span>
          <p>{subject}</p>
        </span>
      )
    );
    setSubjectList(tempSubjectList);
  }, [metaInfo, studentsData]);

  return (
    <div className="flex flex-col mt-10 px-4 py-10 rounded-xl bg-white shadow-xl">
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-center pl-3">
          {metaInfo.batch === "DEFAULT" ||
          metaInfo.batch === null ||
          metaInfo.batch === undefined ? (
            <h1 className="font-bold text-3xl">Class {metaInfo.class}</h1>
          ) : (
            <h1 className="font-bold text-3xl">{metaInfo.batch}</h1>
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
                    <input type="checkbox" className="checkbox" />
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
      <div className="flex flex-row justify-end w-100 mt-10">
        <div className="w-4/12 px-3">
          <input
            placeholder="Search..."
            className="input w-full max-w-lg"
            type="text"
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col space-y-5">
        <div className="overflow-x-auto mt-14">
          <table className="table w-full" {...getTableProps()}>
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <td
                      className="studentTableTh"
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      <span className="flex">
                        {column.render("Header")}
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <img
                              src={dropDown.src}
                              className="ml-2 w-4 m-0"
                              alt="Sort in Descending Order"
                            />
                          ) : (
                            <img
                              src={dropDown.src}
                              className="transform ml-2 rotate-180 w-4 m-0"
                              alt="Sort in Ascending Order"
                            />
                          )
                        ) : (
                          ""
                        )}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => {
                      return (
                        <td className="studentTableTh" {...cell.getCellProps()}>
                          {cell.render("Cell")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* buttons to navigate page */}
          <div className="flex justify-between mt-10 mb-5">
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
            >
              <img src={dropDown.src} className="transform rotate-90 w-6" />
            </button>
            <span>
              Page{" "}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>
            </span>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => nextPage()}
              disabled={!canNextPage}
            >
              <img src={dropDown.src} className="transform -rotate-90 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
