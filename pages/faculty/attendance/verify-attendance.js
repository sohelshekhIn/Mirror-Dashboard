import Loading from "../../../components/utilities/Loading";
import PageNotFound from "../../404";
import { signIn, useSession } from "next-auth/react";
import { DashboardContent } from "../../../components/faculty/Navbar";
import { useEffect, useMemo, useState } from "react";
import NotificationAlert from "../../../components/utilities/NotificationAlert";
import axios from "axios";
import { useTable } from "react-table";
import Link from "next/link";

export default function VerifyAttendance() {
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

  // === Main Data === //
  const [apiData, setApiData] = useState([]);
  const [notification, setNotification] = useState({
    message: null,
    type: null,
  });

  const tableColumns = [
    {
      Header: "Sr.",
      id: "id",
      width: 50,
      Cell: ({ row }) => row.index + 1,
    },
    {
      Header: "Batch",
      accessor: "attributes.AttendanceId",
      width: 80,
      Cell: ({ value }) => {
        let batch = value.split("_")[0];
        if (parseInt(batch).toString().length == 1) {
          console.log("One");
          batch = batch.slice(0, 1) + " " + batch.slice(1);
        } else {
          batch = batch.slice(0, 2) + " " + batch.slice(2);
        }
        return batch;
      },
    },
    {
      Header: "Status",
      accessor: "attributes.reasonDataStatus",
      Cell: ({ value }) => {
        if (value == "verified") {
          return <div className="badge badge-success p-3">Verified</div>;
        } else if (value == "pending") {
          return <div className="badge badge-warning p-3">Pending</div>;
        } else {
          return <div className="badge badge-error p-3">Not Verified</div>;
        }
      },
    },
    {
      Header: "Action",
      id: "actionBtn",
      accessor: "id",
      width: 100,
      Cell: ({ value }) => {
        console.log(value);
        return (
          <Link
            href={"/faculty/attendance/verify-batch-attendance?id=" + value}
          >
            <a className="btn btn-modal">Verify</a>
          </Link>
        );
      },
    },
  ];

  const columns = useMemo(() => tableColumns, []);
  const tableData = useMemo(() => apiData, [apiData]);

  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } =
    useTable({
      columns,
      data: tableData,
    });

  useEffect(() => {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, "0");
    let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    let yyyy = today.getFullYear();
    today = dd + "/" + mm + "/" + yyyy;

    axios
      .get(
        process.env.NEXT_PUBLIC_STRAPI_API +
          `/attendances?filters[AttendanceId][$contains]=${today}&filters[data][$notNull]=true`,
        {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        }
      )
      .then((res) => {
        console.log(res.data.data);
        setApiData(res.data.data);
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

  return (
    <DashboardContent>
      <div className="flex flex-col  w-full">
        <div className="flex flex-col lg:w-8/12">
          <div className="flex flex-col">
            <h1 className="heading1 text-primary">Verify Attendance</h1>
            <span className="underline w-24 my-4"></span>
          </div>
          <div className="py-5 px-2 lg:py-8 lg:px-5 mt-10 rounded-xl shadow-lg bg-white">
            <div className="overflow-x-auto">
              <table {...getTableProps()} className="table w-full">
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <td
                          {...column.getHeaderProps()}
                          width={column.width}
                          className="studentTableTh"
                        >
                          {column.render("Header")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {rows.map((row) => {
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
