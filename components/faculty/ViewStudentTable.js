import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";

import { dropDown } from "../../public/images";

export default function ViewStudentTable({ metaInfo, studentsData }) {
  // console.log(metaInfo);
  // console.log(studentsData);

  const [subjectList, setSubjectList] = useState([]);
  // const [pageSize, setPageSize] = useState(10);

  // table columns
  const tableColumns = [
    {
      Header: "User Id",
      accessor: "UserID",
    },
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
      // return a tag to call to the number
      Cell: ({ value }) => <a href={`tel:${value}`}>{value}</a>,
    },
    {
      Header: "Mother Mobile",
      accessor: "motherMobile",
      //  return a tag to call to the number
      Cell: ({ value }) => <a href={`tel:${value}`}>{value}</a>,
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
      Cell: ({ value }) => <a href={`tel:${value}`}>{value}</a>,
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
      Header: "Action",
      accessor: "action",
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

  console.log(studentsData);
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
    allColumns,
    setPageSize,
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageSize: 10,
        hiddenColumns: [
          "motherName",
          "canLogin",
          "blocked",
          "msgMobile",
          "joinDate",
          "dob",
          "school",
          "motherMobile",
          "subjects",
        ],
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { globalFilter, pageIndex, pageSize } = state;
  console.log(pageSize);
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

  const [menuData, setMenuData] = useState([
    {
      name: "Edit",
    },
    {
      name: "Delete",
    },
    {
      name: "Block",
    },
  ]);

  // Menu Road Map
  // Menu will will contain the following options
  // 1. Add and remove row - followed by a dialog box with checkboxs
  // 2. Print
  // 3. Export

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
              tabIndex="0"
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {allColumns.map((column) => (
                <label
                  key={column.id}
                  className="label w-full flex justify-between"
                >
                  <span className="label-text">{column.Header}</span>
                  <input
                    type="checkbox"
                    className="checkbox"
                    {...column.getToggleHiddenProps()}
                  />
                </label>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-row flex-wrap space-x-5 items-center">
          {subjectList}
        </div>
      </div>
      <div className="flex flex-row justify-end w-100 mt-10">
        <div className="w-full md:w-4/12 px-3">
          <input
            placeholder="Search..."
            className="input w-full max-w-lg"
            type="text"
            accessKey="W"
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
        </div>
        {/* buttons to navigate page */}
        <div className="flex mt-10 mb-5 justify-between">
          {/* dropdown to select number of entries per page */}
          <div className="flex flex-row">
            <div className="flex items-center w-full space-x-3">
              <select
                className="input w-sm max-w-sm"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <p>Entries per page</p>
            </div>
          </div>
          <div className="flex space-x-5 justify-between items-center">
            <button
              className="btn btn-sm btn-ghost bg-transparent"
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
            >
              <img src={dropDown.src} className="transform rotate-90 w-6" />
            </button>
            <span>
              <strong>
                {pageIndex + 1}/{pageOptions.length}
              </strong>
            </span>
            <button
              className="btn btn-sm btn-ghost bg-transparent"
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
