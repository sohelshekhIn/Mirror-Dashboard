import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import { DashboardContent } from "../../../components/faculty/Navbar";
import Loading from "../../../components/utilities/Loading";
import NotificationAlert from "../../../components/utilities/NotificationAlert";
import { search, dropDown } from "../../../public/images";
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
  const [submissions, setSubmissions] = useState([]);

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

  const tableColumns = [
    {
      Header: "Sr.",
      id: "id",
      Cell: ({ row }) => row.index + 1,
    },
    {
      Header: "Date",
      accessor: "SubmissionId",
      id: "date",
      Cell: ({ value }) => {
        return value.split("_")[2];
      },
    },
    {
      Header: "Batch",
      id: "batch",
      accessor: "SubmissionId",
      Cell: ({ value }) => {
        return value.split("_")[0];
      },
    },
    {
      Header: "Subject",
      id: "subject",
      accessor: "SubmissionId",
      Cell: ({ value }) => {
        return value.split("_")[1];
      },
    },
    {
      Header: "Title",
      accessor: "data.submissionTitle",
    },
    {
      Header: "Added by",
      accessor: "data.addedBy",
      Cell: ({ value }) => {
        return value[1];
      },
    },
    {
      Header: "Action",
      id: "action",
      accessor: "id",
      Cell: ({ value }) => {
        return (
          <Link href={`/faculty/manage-submissions/edit-details?id=${value}`}>
            <a className="btn modal-button">Edit</a>
          </Link>
        );
      },
    },
  ];

  //               {
  //                 data.user.facultyData["submissionViewMode"] === "*" ? (
  //                   <td className="studentTableTh">{addedBy}</td>
  //                 ) : (
  //                   ""
  //                 );
  //               }
  //               {
  //                 /*
  // Checks if user has permission to edit submission
  // Refer components > Faculty > Navbar.js > moduleLinks{...}
  // */
  //               }
  //               {
  //                 data.user.facultyData["facultyRoles"].includes(21) ? (
  //                   <td className="studentTableTh">
  //                     <Link
  //                       href={`/faculty/manage-submissions/edit-details/${submissions[i].id}`}
  //                     >
  //                       <a className="btn btn-modal">Edit</a>
  //                     </Link>
  //                   </td>
  //                 ) : (
  //                   ""
  //                 );
  //               }
  const columns = useMemo(() => tableColumns, []);
  const tableData = useMemo(() => submissions, [submissions]);
  let columnsToHide = [];
  data.user.facultyData["submissionViewMode"] === "*"
    ? columnsToHide.push("addedBy")
    : null && data.user.facultyData["facultyRoles"].includes(21)
    ? columnsToHide.push("action")
    : null;
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    setGlobalFilter,
    setPageSize,
    nextPage,
  } = useTable(
    {
      columns,
      data: tableData,
      initialState: {
        pageSize: 10,
        hiddenColumns: columnsToHide,
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { globalFilter, pageIndex, pageSize } = state;

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
          <div className="py-5 px-2 lg:py-8 lg:px-5 rounded-xl shadow-lg bg-white">
            <div className="flex flex-row justify-end w-100 my-10">
              <div className="w-4/12 px-3">
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
            <div className="overflow-x-auto">
              <table className="table w-full" {...getTableProps}>
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <td
                          className="studentTableTh"
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
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
                            <td
                              className="studentTableTh"
                              {...cell.getCellProps()}
                            >
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
                  <img
                    src={dropDown.src}
                    className="transform -rotate-90 w-6"
                  />
                </button>
              </div>
            </div>
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
