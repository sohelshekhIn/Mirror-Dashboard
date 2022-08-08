import Loading from "../../../components/utilities/Loading";
import PageNotFound from "../../404";
import { signIn, useSession } from "next-auth/react";
import { DashboardContent } from "../../../components/faculty/Navbar";
import { useEffect, useMemo, useState } from "react";
import NotificationAlert from "../../../components/utilities/NotificationAlert";
import axios from "axios";
import { useTable } from "react-table";
import Link from "next/link";
import { useRouter } from "next/router";

export default function VerifyBatchForAttendace() {
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

  const router = useRouter();
  const [apiData, setApiData] = useState([]);
  const [notification, setNotification] = useState({
    message: null,
    type: null,
  });

  const { id } = router.query;
  useEffect(() => {
    if (id !== undefined) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_STRAPI_API}/info/attendance/verify-batch?id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${data.user.accessToken}`,
            },
          }
        )
        .then((res) => {
          console.log(res.data);
          setApiData(res.data[0].studentData);
        })
        .catch((err) => {
          console.log(err);
          setNotification({
            message: `${err.name}: ${err.message}`,
            type: "error",
            id: new Date(),
          });
        });
    }
  }, [id]);

  const tableColumns = [
    {
      Header: "Sr.",
      id: "id",
      Cell: ({ row }) => row.index + 1,
    },
    {
      Header: "Name",
      id: "studentName",
      accessor: "name",
    },
    {
      Header: "Mother Name",
      id: "motherName",
      accessor: "motherName",
    },
    {
      Header: "Mother Mobile",
      id: "motherMobile",
      accessor: "motherMobile",
      Cell: ({ value }) => {
        return (
          <a href={`tel:${value}`}>
            <span>{value}</span>
          </a>
        );
      },
    },
    {
      Header: "Message Mobile",
      id: "messageMobile",
      accessor: "msgMobile",
      Cell: ({ value }) => {
        return (
          <a href={`tel:${value}`}>
            <span>{value}</span>
          </a>
        );
      },
    },
    {
      Header: "Reason",
      id: "reason",
      accessor: "name",
      Cell: ({ value }) => {
        return (
          <textarea
            className="textarea"
            placeholder={`Reason for ${value.split(" ")[0]}'s absent`}
          ></textarea>
        );
      },
    },
  ];

  const columns = useMemo(() => tableColumns, []);
  const tableData = useMemo(() => apiData, [apiData]);

  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } =
    useTable({ columns, data: tableData });

  return (
    <DashboardContent>
      <div className="flex flex-col  w-full">
        <div className="flex flex-col w-full">
          <div className="flex flex-col">
            <h1 className="heading1 text-primary">Verify Attendance</h1>
            <span className="underline w-24 my-4"></span>
          </div>
          <div className="py-5 px-2 lg:py-8 mt-10 lg:px-5 rounded-xl shadow-lg bg-white">
            <div className="overflow-x-auto">
              <table {...getTableProps()} className="table w-full">
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <td
                          {...column.getHeaderProps()}
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
            <div className="w-full mt-10 flex justify-end">
              {/* submit button */}
              <button
                className="btn btn-accent w-max-xs"
                onClick={() => {
                  setNotification({
                    message: "Attendance Verified Successfully",
                    type: "success",
                    id: new Date(),
                  });
                }}
              >
                Save
              </button>
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
