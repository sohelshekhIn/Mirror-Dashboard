import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { DashboardContent } from "../../../components/faculty/Navbar";
import Loading from "../../../components/utilities/Loading";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import NotificationAlert from "../../../components/utilities/NotificationAlert";
import { dropDown } from "../../../public/images";

export default function ViewBatches() {
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
    !data.user.facultyData["facultyRoles"].includes(154)
  ) {
    return <PageNotFound />;
  }

  // === Main ===
  const [notification, setNotification] = useState({
    type: null,
    message: null,
  });
  const [validationError, setValidationError] = useState(null);
  const [modalComp, setModalComp] = useState([]);
  const [apiData, setApiData] = useState([]);
  const [modalFormData, setModalFormData] = useState({
    batchName: "",
    batchTimingFrom: "",
    batchTimingTo: "",
    subjects: [],
  });

  useEffect(() => {
    console.log(modalFormData);
  });

  const tableColumns = [
    {
      Header: "Sr.",
      id: "id",
      Cell: ({ row }) => row.index + 1,
    },
    {
      Header: "Class",
      id: "class",
      accessor: "attributes.batch",
      Cell: ({ value }) => {
        let batch = value.split("_")[0];
        if (parseInt(batch).toString().length == 1) {
          batch = batch.slice(0, 1) + " " + batch.slice(1);
        } else {
          batch = batch.slice(0, 2) + " " + batch.slice(2);
        }
        return batch.split(" ")[0];
      },
    },
    {
      Header: "Batch",
      accessor: "attributes.batch",
      Cell: ({ value }) => {
        let batch = value.split("_")[0];
        if (parseInt(batch).toString().length == 1) {
          batch = batch.slice(0, 1) + " " + batch.slice(1);
        } else {
          batch = batch.slice(0, 2) + " " + batch.slice(2);
        }
        return batch.split(" ")[2];
      },
    },
    {
      Header: "Timing",
      accessor: "attributes.timings",
      Cell: ({ value }) => {
        // Check if value is not null
        if (value) {
          let from = value[0].split(":");
          let to = value[1].split(":");
          if (from[0] > 12) {
            from[0] = from[0] - 12;
            from = from.join(":");
          }
          if (to[0] > 12) {
            to[0] = to[0] - 12;
            to = to.join(":");
          }
          if (from[0] == 12) {
            from[0] == 12;
            from = from.join(":");
          }

          return from + " - " + to;
        } else {
          return "Not Set";
        }
      },
    },
    {
      Header: "Subjects",
      id: "subjects",
      accessor: "attributes.subjects",
      Cell: ({ value }) => {
        return value.join(", ");
      },
    },
    {
      Header: "Action",
      id: "actionBtn",
      accessor: "id",
      Cell: ({ value }) => {
        return (
          <label
            onClick={() => {
              loadModalData(value);
            }}
            className="btn btn-modal"
            htmlFor="edit-batch-modal"
          >
            Edit
          </label>
        );
      },
    },
  ];

  const columns = useMemo(() => tableColumns, []);
  const tableData = useMemo(() => apiData, [apiData]);
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
        pageSize: 20,
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { globalFilter, pageIndex, pageSize } = state;

  useEffect(() => {
    setValidationError(null);
    if (modalFormData.id !== "add") {
      axios
        .get(
          process.env.NEXT_PUBLIC_STRAPI_API +
            "/batches?fields[0]=batch&fields[1]=subjects&fields[2]=timings",
          {
            headers: {
              Authorization: `Bearer ${data.user.accessToken}`,
            },
          }
        )
        .then((res) => {
          setApiData(res.data.data);
          console.log(res.data.data);
        })
        .catch((err) => {
          setNotification({
            message: err.message,
            type: "error",
            id: new Date(),
          });
          console.log(err);
        });
    }
  }, [modalComp]);

  const handleChange = (e) => {
    if (e.target.name === "subjects") {
      // check is subject is already selected
      if (modalFormData.subjects.includes(e.target.value)) {
        // remove subject
        let temp = modalFormData.subjects;
        temp.splice(temp.indexOf(e.target.value), 1);
        setModalFormData({ ...modalFormData, subjects: temp });
      } else {
        // add subject
        setModalFormData({
          ...modalFormData,
          subjects: [...modalFormData.subjects, e.target.value],
        });
      }
    } else {
      setModalFormData({
        ...modalFormData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = (e) => {
    console.log(modalFormData);
    e.preventDefault();
    // if modalFormData is empty show validation error
    if (modalFormData.batchName === "" || modalFormData.subjects.length === 0) {
      setValidationError("Please fill all the fields");
      return;
    }
    // if modalFormData.id is add then add new batch
    if (modalFormData.id === "add") {
      axios
        .post(
          process.env.NEXT_PUBLIC_STRAPI_API + "/batches/",
          {
            data: {
              batch: modalFormData.batchName,
              subjects: modalFormData.subjects,
              timings: [
                modalFormData.batchTimingFrom,
                modalFormData.batchTimingTo,
              ],
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
            message: "Batch added successfully",
            type: "success",
            id: new Date(),
          });
          setModalComp([]);
        })
        .catch((err) => {
          setNotification({
            message: err.message,
            type: "error",
            id: new Date(),
          });
          console.log(err);
        });
    } else {
      axios
        .put(
          process.env.NEXT_PUBLIC_STRAPI_API + "/batches/" + modalFormData.id,
          {
            data: {
              batch: modalFormData.batchName,
              subjects: modalFormData.subjects,
              timings: [
                modalFormData.batchTimingFrom,
                modalFormData.batchTimingTo,
              ],
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
            message: "Batch updated successfully",
            type: "success",
            id: new Date(),
          });
          handleClose();
          setModalComp([]);
        })
        .catch((err) => {
          setNotification({
            message: err.message,
            type: "error",
            id: new Date(),
          });
          console.log(err);
        });
    }
    setModalFormData({
      batchName: "",
      subjects: [],
    });
  };

  // handle delete
  const handleDelete = () => {
    axios
      .delete(
        process.env.NEXT_PUBLIC_STRAPI_API + "/batches/" + modalFormData.id,
        {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        }
      )
      .then((res) => {
        setNotification({
          message: "Batch deleted successfully",
          type: "success",
          id: new Date(),
        });
        setModalComp([]);
      })
      .catch((err) => {
        // if error is 404 then batch already deleted
        if (err.response.status === 404) {
          setNotification({
            message: "Batch already deleted",
            type: "error",
            id: new Date(),
          });
        } else {
          setNotification({
            message: err.message,
            type: "error",
            id: new Date(),
          });
        }
        console.log(err);
      });
  };

  // TO DO:
  // 1. Add validation for batchName
  // 2. Add validation for subjects
  // 3. Edit option not working properly

  // when modal is closed set all subjects to false
  const handleClose = (e) => {
    if (e.target.checked === false) {
      console.log("All checkboxes set to false");
      // get all checkboxes with name subjects
      let checkboxes = document.getElementsByName("subjects");
      console.log(checkboxes);
      // loop through all checkboxes and set them to false
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
        console.log(checkboxes[i].checked);
      }
    }
  };
  // }

  const loadModalData = (key) => {
    if (key === "add") {
      setModalFormData({
        id: "add",
        class: "Add Batch",
        batchName: "",
        subjects: [],
      });
      renderModal();
    } else if (key !== null) {
      // axios get batch
      axios
        .get(process.env.NEXT_PUBLIC_STRAPI_API + `/batches/${key}`, {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        })
        .then((res) => {
          let tempBatchTimingFrom = "";
          let tempBatchTimingTo = "";
          if (res.data.data.attributes.timings != null) {
            tempBatchTimingFrom = res.data.data.attributes.timings[0];
            tempBatchTimingTo = res.data.data.attributes.timings[1];
          }
          setModalFormData({
            id: res.data.data.id,
            class: res.data.data.attributes.batch,
            batchName: res.data.data.attributes.batch,
            subjects: res.data.data.attributes.subjects,
            batchTimingFrom: tempBatchTimingFrom,
            batchTimingTo: tempBatchTimingTo,
          });

          renderModal();
        })
        .catch((err) => {
          setNotification({
            message: err.message,
            type: "error",
            id: new Date(),
          });
          console.log(err);
        });
    }
  };

  useEffect(() => {
    if (modalFormData.id !== null) {
      renderModal();
      for (let i = 0; i < modalFormData.subjects.length; i++) {
        if (modalFormData.subjects[i] === "Maths") {
          document.getElementById("maths").checked = true;
        } else if (modalFormData.subjects[i] === "Physics") {
          document.getElementById("physics").checked = true;
        } else if (modalFormData.subjects[i] === "Chemistry") {
          document.getElementById("chemistry").checked = true;
        } else if (modalFormData.subjects[i] === "Biology") {
          document.getElementById("biology").checked = true;
        } else if (modalFormData.subjects[i] === "English") {
          document.getElementById("english").checked = true;
        } else if (modalFormData.subjects[i] === "Science") {
          document.getElementById("science").checked = true;
        } else if (modalFormData.subjects[i] === "EVS") {
          document.getElementById("evs").checked = true;
        } else if (modalFormData.subjects[i] === "S.S.") {
          document.getElementById("ss").checked = true;
        } else if (modalFormData.subjects[i] === "Subject 2") {
          document.getElementById("subject2").checked = true;
        } else if (modalFormData.subjects[i] === "Subject 3") {
          document.getElementById("subject3").checked = true;
        }
      }
    }
  }, [modalFormData]);

  const renderModal = () => {
    setModalComp([
      <div className="modal py-5">
        <div className="modal-box relative">
          <label
            htmlFor="edit-batch-modal"
            className="btn btn-sm btn-circle absolute right-3 top-3"
          >
            ✕
          </label>
          <div className="flex flex-col mt-5">
            <form>
              <h1 className="text-neutral text-2xl font-bold">
                {modalFormData.id === "add"
                  ? "Add Batch"
                  : `Edit Batch (${modalFormData.class})`}
              </h1>
              {/* if validation error is there then show */}
              {validationError && (
                <div className="text-error text-center mt-8">
                  <p>{validationError}</p>
                </div>
              )}
              <div className="flex flex-col space-y-5 mt-5">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Enter batch name</span>
                  </label>
                  <input
                    type="text"
                    accessKey="Q"
                    value={modalFormData.batchName}
                    onChange={handleChange}
                    name="batchName"
                    placeholder="Batch Name"
                    className="input input-bordered w-full max-w-md"
                  />
                </div>
                <div>
                  <span className="label-text">Enter batch timing</span>
                  <div className="flex m-0 space-x-2">
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">From</span>
                      </label>
                      <input
                        type="time"
                        value={modalFormData.batchTimingFrom}
                        onChange={handleChange}
                        name="batchTimingFrom"
                        placeholder="From"
                        className="input input-bordered w-full max-w-md"
                      />
                    </div>
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">To</span>
                      </label>
                      <input
                        type="time"
                        value={modalFormData.batchTimingTo}
                        onChange={handleChange}
                        name="batchTimingTo"
                        placeholder="To"
                        className="input input-bordered w-full max-w-md"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Select Subjects</span>
                  </label>
                  <div className="flex flex-row mt-5">
                    {/* 10 checkbox for 10 subjects */}
                    <div className="flex flex-col space-y-5 w-1/2 px-10">
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">Maths</span>
                          <input
                            type="checkbox"
                            id="maths"
                            onChange={handleChange}
                            name="subjects"
                            className="checkbox"
                            value="Maths"
                          />
                        </label>
                      </div>
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">Physics</span>
                          <input
                            type="checkbox"
                            id="physics"
                            onChange={handleChange}
                            name="subjects"
                            className="checkbox"
                            value="Physics"
                          />
                        </label>
                      </div>
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">Chemistry</span>
                          <input
                            type="checkbox"
                            id="chemistry"
                            onChange={handleChange}
                            name="subjects"
                            className="checkbox"
                            value="Chemistry"
                          />
                        </label>
                      </div>
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">Biology</span>
                          <input
                            type="checkbox"
                            id="biology"
                            onChange={handleChange}
                            name="subjects"
                            className="checkbox"
                            value="Biology"
                          />
                        </label>
                      </div>
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">English</span>
                          <input
                            type="checkbox"
                            id="english"
                            onChange={handleChange}
                            name="subjects"
                            value="English"
                            className="checkbox"
                          />
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-5 w-1/2 px-10">
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">Science</span>
                          <input
                            type="checkbox"
                            id="science"
                            onChange={handleChange}
                            name="subjects"
                            value="Science"
                            className="checkbox"
                          />
                        </label>
                      </div>
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">EVS</span>
                          <input
                            type="checkbox"
                            id="evs"
                            onChange={handleChange}
                            value="EVS"
                            name="subjects"
                            className="checkbox"
                          />
                        </label>
                      </div>
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">S.S.</span>
                          <input
                            type="checkbox"
                            id="ss"
                            onChange={handleChange}
                            value="S.S."
                            name="subjects"
                            className="checkbox"
                          />
                        </label>
                      </div>
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">Subject 2 </span>
                          <input
                            type="checkbox"
                            id="subject2"
                            onChange={handleChange}
                            value="Subject 2"
                            name="subjects"
                            className="checkbox"
                          />
                        </label>
                      </div>
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">Subject 3</span>
                          <input
                            type="checkbox"
                            id="subject3"
                            onChange={handleChange}
                            value="Subject 3"
                            name="subjects"
                            className="checkbox"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-5 justify-end pt-5">
                  {/* if id is add then dont show delete button */}
                  {modalFormData.id !== "add" && (
                    <button
                      tabIndex="-1"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete the batch? \nDeleting the batch will also delete all the students in the batch."
                          )
                        ) {
                          handleDelete();
                        }
                      }}
                      type="button"
                      className="btn btn-ghost text-error"
                    >
                      Delete Batch
                    </button>
                  )}
                  {/* save batch button */}
                  <button
                    onClick={handleSubmit}
                    type="submit"
                    accessKey="S"
                    className="btn btn-secondary"
                  >
                    Save Batch
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>,
    ]);
  };
  return (
    <DashboardContent>
      <div className="flex flex-col">
        <div className="flex flex-col">
          <h1 className="heading1 text-primary">Manage Batches</h1>
          <span className="underline w-24 my-4"></span>
        </div>
        <div className="flex justify-end">
          {/* add batch button */}
          <label
            onClick={() => {
              loadModalData("add");
            }}
            type="button"
            className="btn btn-secondary"
            htmlFor="edit-batch-modal"
            accessKey="A"
          >
            Add Batch
          </label>
        </div>
        <div className="flex flex-col px-4 py-10 mt-10 bg-white rounded-xl shadow-xl">
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
          <div className="flex flex-col overflow-x-auto">
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
                <img src={dropDown.src} className="transform -rotate-90 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <input
        type="checkbox"
        onChange={handleClose}
        id="edit-batch-modal"
        className="modal-toggle"
      />
      {modalComp}
      <NotificationAlert
        message={notification.message}
        type={notification.type}
        id={notification.id}
      />
    </DashboardContent>
  );
}
