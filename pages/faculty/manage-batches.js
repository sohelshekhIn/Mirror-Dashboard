import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardContent } from "../../components/faculty/Navbar";
import Loading from "../../components/utilities/Loading";
import NotificationAlert from "../../components/utilities/NotificationAlert";

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
  const [tableBatchData, setTableBatchData] = useState();
  const [modalComp, setModalComp] = useState([]);
  const [modalFormData, setModalFormData] = useState({
    batchName: "",
    subjects: [],
  });

  useEffect(() => {
    setValidationError(null);
    if (modalFormData.id !== "add") {
      axios
        .get(
          process.env.NEXT_PUBLIC_STRAPI_API +
            "/batches?fields[0]=batch&fields[1]=subjects",
          {
            headers: {
              Authorization: `Bearer ${data.user.accessToken}`,
            },
          }
        )
        .then((res) => {
          let tempBatch = {};
          for (let key in res.data.data) {
            if (
              data.user.facultyData["allowedBatches"].includes(
                res.data.data[key].attributes.batch
              ) ||
              data.user.facultyData["allowedBatches"] === "*"
            ) {
              tempBatch[res.data.data[key].id] = {
                batch: res.data.data[key].attributes.batch,
                subjects: res.data.data[key].attributes.subjects,
              };
            }
          }
          // tempBatch structure:
          // {
          //   id: {
          //        batch: "12 NCERT"
          //        subjects: ["Chemistry", "Physics", "Maths", "Biology"],
          // }
          // }
          let tempTableData = [];
          let count = 1;
          for (let key in tempBatch) {
            tempTableData.push(
              <tr>
                <td className="batchTableTh">{count}</td>
                <td className="batchTableTh">
                  {tempBatch[key].batch.split(" ")[0]}
                </td>
                <td className="batchTableTh">
                  {tempBatch[key].batch.split(" ")[1]}
                </td>
                <td className="batchTableTh">
                  {tempBatch[key].subjects.join(", ")}
                </td>

                <td className="batchTableTh">
                  <button
                    onClick={() => {
                      loadModalData(key);
                    }}
                    className="btn btn-modal"
                  >
                    <label htmlFor="edit-batch-modal">Edit</label>
                  </button>
                </td>
              </tr>
            );
            count++;
          }
          setTableBatchData(tempTableData);
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
    if (e.target.name === "batchName") {
      setModalFormData({
        ...modalFormData,
        [e.target.name]: e.target.value,
      });
    } else {
      setModalFormData({
        ...modalFormData,
        [e.target.name]: e.target.value.split(", "),
      });
    }
  };

  const handleSubmit = (e) => {
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

  const loadModalData = (key) => {
    console.log(key);
    if (key === "add") {
      setModalFormData({
        id: "add",
        class: "Add Batch",
        batchName: "",
        subjects: [],
      });
      renderModal();
      console.log(modalFormData);
    } else if (key !== null) {
      // axios get batch
      axios
        .get(process.env.NEXT_PUBLIC_STRAPI_API + `/batches/${key}`, {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        })
        .then((res) => {
          setModalFormData({
            id: res.data.data.id,
            class: res.data.data.attributes.batch,
            batchName: res.data.data.attributes.batch,
            subjects: res.data.data.attributes.subjects,
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
              <h1 className="text-secondary text-2xl font-bold">
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
                <div class="form-control w-full">
                  <label class="label">
                    <span class="label-text">Enter Batch Name</span>
                  </label>
                  <input
                    type="text"
                    value={modalFormData.batchName}
                    onChange={handleChange}
                    name="batchName"
                    placeholder="Batch Name"
                    className="input input-bordered w-full max-w-md"
                  />
                </div>
                <div class="form-control w-full">
                  <label class="label">
                    <span class="label-text">
                      Enter Subjects (separate by comma)
                    </span>
                  </label>
                  {/* <input
                    type="text"
                    value={modalFormData.subjects.join(", ")}
                    onChange={handleChange}
                    name="subjects"
                    placeholder="Subjects"
                    className="input input-bordered w-full max-w-md"
                  /> */}
                  <div className="flex flex-col"></div>
                </div>
                <div className="flex space-x-5 justify-end pt-5">
                  {/* if id is add then dont show delete button */}
                  {modalFormData.id !== "add" && (
                    <button
                      tabIndex="-1"
                      onClick={() => {
                        if (
                          window.confirm("Are you sure you want to delete?")
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
                    className="btn btn-accent"
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
          <button
            onClick={() => {
              loadModalData("add");
            }}
            type="button"
            className="btn btn-accent"
          >
            <label htmlFor="edit-batch-modal">Add Batch</label>
          </button>
        </div>
        <div className="flex flex-col px-4 py-10 mt-10 bg-white rounded-xl shadow-xl">
          <div className="flex flex-col overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="batchTableTh">Sr.</th>
                  <th className="batchTableTh">Class</th>
                  <th className="batchTableTh">Batch</th>
                  <th className="batchTableTh">Subjects</th>
                  <th className="batchTableTh"></th>
                </tr>
              </thead>
              <tbody>{tableBatchData}</tbody>
            </table>
          </div>
        </div>
      </div>
      <input type="checkbox" id="edit-batch-modal" className="modal-toggle" />
      {modalComp}
      <NotificationAlert
        message={notification.message}
        type={notification.type}
        id={notification.id}
      />
    </DashboardContent>
  );
}
