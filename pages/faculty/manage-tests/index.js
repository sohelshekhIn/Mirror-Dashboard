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
import { dropDown, search } from "../../../public/images";
import PageNotFound from "../../404";

export default function ManageTests() {
  const { status, data } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });
  if (status === "loading") {
    return <Loading />;
  }
  {
    /* 
Checks if user has permission to view this page
Refer components > Faculty > Navbar.js > moduleLinks{...}
*/
  }
  if (
    (data.user && data.user.role !== "faculty") ||
    !data.user.facultyData["facultyRoles"].includes(17)
  ) {
    return <PageNotFound />;
  }

  // === Main ===
  const [notification, setNotification] = useState({
    type: null,
    message: null,
  });

  const [tests, setTests] = useState([]);

  const tableColumns = [
    {
      Header: "Sr.",
      id: "sr",
      Cell: ({ row }) => row.index + 1,
    },
    {
      Header: "Date",
      id: "date",
      accessor: "TestId",
      Cell: ({ value }) => {
        return value.split("_")[2];
      },
    },
    {
      Header: "Batch",
      id: "batch",
      accessor: "TestId",
      Cell: ({ value }) => {
        let batch = value.split("_")[0];
        if (parseInt(batch).toString().length == 1) {
          batch = batch.slice(0, 1) + " " + batch.slice(1);
        } else {
          batch = batch.slice(0, 2) + " " + batch.slice(2);
        }
        return batch;
      },
    },
    {
      Header: "Subject",
      id: "subject",
      accessor: "TestId",
      Cell: ({ value }) => {
        return value.split("_")[1];
      },
    },
    {
      Header: "Title",
      id: "title",
      accessor: "data.testTitle",
    },
    {
      Header: "Added By",
      id: "addedBy",
      accessor: "data.addedBy",
      Cell: ({ value }) => value[1],
    },
    {
      Header: "",
      id: "actionBtn",
      accessor: "id",
      Cell: ({ value }) => {
        return (
          <Link href={"/faculty/manage-tests/edit-details?id=" + value}>
            <a className="btn btn-modal">Edit</a>
          </Link>
        );
      },
    },
  ];

  const columns = useMemo(() => tableColumns, []);
  const tableData = useMemo(() => tests, [tests]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    state,
    previousPage,
    canPreviousPage,
    canNextPage,
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
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { globalFilter, pageIndex, pageSize } = state;

  useEffect(() => {
    let testAllowId = data.user.id;
    if (data.user.facultyData["testsViewMode"] === "*") {
      testAllowId = "*";
    }
    axios
      .post(
        process.env.NEXT_PUBLIC_STRAPI_API + "/info/tests",
        {
          data: {
            id: testAllowId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        }
      )
      .then((res) => {
        setTests(res.data);
        console.log(res.data);
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

  return (
    <DashboardContent>
      <div className="flex flex-col">
        <div className="flex flex-col">
          <h1 className="heading1 text-primary">Manage Tests</h1>
          <span className="underline w-24 my-4"></span>
        </div>
        <div className="flex flex-col max-w-6xl space-y-5 ">
          {/* 
Checks if user has permission to add new test
Refer components > Faculty > Navbar.js > moduleLinks{...}
*/}
          {data.user.facultyData["facultyRoles"].includes(18) ? (
            <div className="flex justify-end">
              <Link href="/faculty/manage-tests/new-test">
                <a accessKey="A" className="btn btn-accent">
                  Add new Test
                </a>
              </Link>
            </div>
          ) : (
            <div className="flex justify-end"></div>
          )}
          <div className=" py-5 px-2 lg:py-8 lg:px-5 rounded-xl shadow-lg bg-white">
            <div className="flex flex-row justify-end w-100 my-10">
              <div className="sm:w-full md:w-7/12 lg:w-4/12 px-3">
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
              <table {...getTableProps} className="table w-full">
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <td
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                          className="studentTableTh"
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
                              {...cell.getCellProps()}
                              className="studentTableTh"
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
        Add test to view <br />
      </span>
    </div>
  );
};
