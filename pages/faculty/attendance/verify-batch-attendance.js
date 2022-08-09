import Loading from "../../../components/utilities/Loading";
import PageNotFound from "../../404";
import { signIn, useSession } from "next-auth/react";
import { DashboardContent } from "../../../components/faculty/Navbar";
import { useEffect, useMemo, useState } from "react";
import NotificationAlert from "../../../components/utilities/NotificationAlert";
import axios from "axios";
import { useTable } from "react-table";
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
  const [tableApiData, setTableApiData] = useState([]);
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
          setApiData(res.data);
          setTableApiData(res.data.studentData);
          // if reasonDataStatus != not_verified then show reasonData in their specific text area
          if (res.data.reasonDataStatus !== "not_verified") {
            // for every key in reasonDataStatus, set the value of the key in the text area
            for (let key in res.data.reasonData) {
              document.getElementById(`reason_${key}`).value =
                res.data.reasonData[key];
            }
          }
        })
        .catch((err) => {
          console.log(err);
          setNotification({
            message: `${err.message}`,
            type: "error",
            id: new Date(),
          });
        });
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let reasonData = {};
    let reasonStatus = "not_verified";
    apiData.data.forEach((UserID) => {
      let reasonText = document.getElementById(`reason_${UserID}`).value;
      if (reasonText === "") {
        reasonStatus = "pending";
      } else {
        reasonStatus = "verified";
      }
      reasonData[UserID] = reasonText;
    });
    // if value of all keys in reasonData is empty, then set reasonStatus to pending
    let keys = Object.keys(reasonData);
    let allEmpty = true;
    for (let i = 0; i < keys.length; i++) {
      if (reasonData[keys[i]] !== "") {
        allEmpty = false;
      }
    }
    if (allEmpty) {
      setNotification({
        message: "Cannot submit empty reason(s)",
        type: "error",
        id: new Date(),
      });
      return;
    }

    axios
      .put(
        process.env.NEXT_PUBLIC_STRAPI_API + "/attendances/" + id,
        {
          data: {
            reasonDataStatus: reasonStatus,
            reasonData: reasonData,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        }
      )
      .then((res) => {
        setNotification({
          message: "Attendance verified successfully",
          type: "success",
          id: new Date(),
        });
        setTimeout(() => {
          router.back();
        }, 2000);
      })
      .catch((err) => {
        console.log(err);
        setNotification({
          message: `${err.message}`,
          type: "error",
          id: new Date(),
        });
      });
  };

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
          <a tabIndex="-1" href={`tel:${value}`}>
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
          <a tabIndex="-1" href={`tel:${value}`}>
            <span>{value}</span>
          </a>
        );
      },
    },
    {
      Header: "Reason",
      id: "reason",
      accessor: "name",
      Cell: ({ value, row }) => {
        return (
          <textarea
            // if row index is zero than add accesskey to textarea
            {...(row.index === 0 ? { accessKey: "Q" } : {})}
            id={`reason_${row.original.UserID}`}
            className="textarea reason"
            placeholder={`Reason why ${value.split(" ")[0]}'s absent`}
          ></textarea>
        );
      },
    },
  ];

  const columns = useMemo(() => tableColumns, []);
  const tableData = useMemo(() => tableApiData, [tableApiData]);
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
                accessKey="S"
                className="btn btn-accent w-max-xs"
                onClick={handleSubmit}
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
