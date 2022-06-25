import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardContent } from "../../../components/faculty/Navbar";
import StudentMarksTableView from "../../../components/faculty/StudentMarksTableView";
import Loading from "../../../components/utilities/Loading";
import NotificationAlert from "../../../components/utilities/NotificationAlert";
import PageNotFound from "../../404";

export default function AddNewTest() {
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
    !data.user.facultyData["facultyRoles"].includes(18) ||
    data.user.facultyData["testsData"].canAdd === false
  ) {
    return <PageNotFound />;
  }

  // === Main ===
  const [batch, setBatch] = useState({
    Loading: {
      batch: "Loading Batches...",
    },
  });
  const [formData, setFormData] = useState({
    class: null,
    batch: null,
    subject: null,
  });
  const [notification, setNotification] = useState({
    type: null,
    message: null,
  });
  const [studentTableViewComp, setStudentTableViewComp] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [dropDownStatus, setDropDownStatus] = useState(true);
  var classes = [];
  var batches = [];

  useEffect(() => {
    document.getElementById("showFormCheckbox").checked = dropDownStatus;
  }, [dropDownStatus]);

  useEffect(() => {
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
        setBatch(tempBatch);
      })
      .catch((err) => {
        setNotification({
          message: err.message,
          type: "error",
          id: new Date(),
        });
        console.log(err);
      });
  }, [data]);

  const toggleShowForm = () => {
    if (dropDownStatus) {
      setDropDownStatus(false);
    } else {
      setDropDownStatus(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.class === "" ||
      formData.class === "DEFAULT" ||
      !formData.class
    ) {
      setValidationError("Please select a class");
      return;
    }
    if (
      formData.batch === "" ||
      formData.batch === "DEFAULT" ||
      !formData.batch
    ) {
      setValidationError("Please select batch");
      return;
    }
    if (
      formData.subject === "" ||
      formData.subject === "DEFAULT" ||
      !formData.subject
    ) {
      setValidationError("Please select subject");
      return;
    }
    setValidationError(null);
    console.log(formData);
    axios
      .post(
        process.env.NEXT_PUBLIC_STRAPI_API + "/data/students/view",
        {
          data: {
            class: formData.class,
            batch: formData.batch,
            subjects: [formData.subject],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        }
      )
      .then((res) => {
        if (res.data.length === 0) {
          setNotification({
            message: "No students found",
            type: "error",
            id: new Date(),
          });
          return;
        }
        console.log(res);
        setStudentTableViewComp(
          <StudentMarksTableView
            session={data}
            setNotification={setNotification}
            testDetails={formData}
            students={res.data}
          />
        );
        toggleShowForm();
      })
      .catch((err) => {
        setNotification({
          message: err.message,
          type: "error",
          id: new Date(),
        });
        console.log(err);
      });
  };

  const handleChange = (e) => {
    if (e.target.name === "class") {
      setValidationError(null);
    }
    // if name is subjects then add to subjects array
    if (e.target.name === "subjects") {
      if (e.target.checked) {
        setFormData({
          ...formData,
          subjects: [...formData.subjects, e.target.value],
        });
      } else {
        setFormData({
          ...formData,
          subjects: formData.subjects.filter(
            (subject) => subject !== e.target.value
          ),
        });
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
    console.log(formData);
  };

  return (
    <DashboardContent>
      <div className="flex flex-col space-y-5">
        <div className="collapse collapse-arrow">
          <input type="checkbox" id="showFormCheckbox" />
          <div className="collapse-title p-0">
            <div className="flex flex-col">
              <h1 className="heading1 text-primary">Add New Test</h1>
              <span className="underline w-24 my-4"></span>
            </div>
          </div>
          <div className="collapse-content p-0">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
              <div className="text-red-400 font-semibold text-md text-center rounded p-2">
                {validationError}
              </div>
              <div className="flex flex-col items-start md:flex-row  space-y-5 space-x-0 md:space-y-0 md:space-x-5">
                <div className="form-control md:mx-0 w-full md:max-w-xs max-w-md">
                  <label className="label">
                    <span className="label-text">Select Class</span>
                  </label>
                  <select
                    accessKey="Q"
                    id="selectClass"
                    defaultValue="DEFAULT"
                    required
                    name="class"
                    onChange={handleChange}
                    value={formData.class}
                    className="select select-bordered"
                  >
                    <option value="DEFAULT">Select Class</option>
                    {/* Options for class 1 to 12 */}
                    {}
                    {Object.keys(batch).map((key) => {
                      if (key === "Loading Batches...") {
                        return (
                          <option disabled value="Loading">
                            "Loading Batches..."
                          </option>
                        );
                      }
                      classes.push(batch[key].batch.split(" ")[0]);
                      // remove duplicates form an array
                    })}
                    {(classes = [...new Set(classes)])}
                    {/* map through classes */}
                    {classes.map((classNo) => {
                      return (
                        <option key={classNo} value={classNo}>
                          {classNo}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-control md:mx-0 w-full md:max-w-xs max-w-md">
                  <label className="label">
                    <span className="label-text">Select Batch</span>
                  </label>
                  <select
                    id="selectBatch"
                    defaultValue="DEFAULT"
                    name="batch"
                    onChange={handleChange}
                    value={formData.batch}
                    className="select select-bordered"
                  >
                    {/* If class is not selected show option to select class */}
                    {formData.class === "DEFAULT" ||
                    formData.class === "" ||
                    formData.class === null ? (
                      <option disabled value="DEFAULT">
                        Select Class First
                      </option>
                    ) : (
                      <option value="DEFAULT">Select Batch</option>
                    )}
                    {/* Key is the Batch Name i.e. 12 NCERT */}
                    {Object.keys(batch).map((key) => {
                      if (batch[key].batch.includes(formData.class)) {
                        batches.push(key);
                        return (
                          <option
                            key={batch[key].batch}
                            value={batch[key].batch}
                          >
                            {batch[key].batch}
                          </option>
                        );
                      }
                    })}
                  </select>
                </div>
              </div>
              <div className="form-control md:mx-0 w-full md:max-w-xs max-w-md">
                <label className="label">
                  <span className="label-text">Select Subject</span>
                </label>
                <select
                  id="selectSubject"
                  defaultValue="DEFAULT"
                  name="subject"
                  onChange={handleChange}
                  value={formData.subject}
                  className="select select-bordered"
                >
                  {/* If class is not selected show option to select class */}
                  {formData.batch === "DEFAULT" ||
                  formData.batch === "" ||
                  formData.batch === null ? (
                    <option disabled value="DEFAULT">
                      Select Batch First
                    </option>
                  ) : (
                    <option value="DEFAULT">Select Subject</option>
                  )}
                  {Object.keys(batch).map((singleBatchKey) => {
                    if (
                      formData.batch &&
                      batch[singleBatchKey].batch === formData.batch
                    ) {
                      return Object.keys(batch[singleBatchKey].subjects).map(
                        (singleSubject) => {
                          return (
                            <option
                              key={
                                batch[singleBatchKey].subjects[singleSubject]
                              }
                              value={
                                batch[singleBatchKey].subjects[singleSubject]
                              }
                            >
                              {batch[singleBatchKey].subjects[singleSubject]}
                            </option>
                          );
                        }
                      );
                    }
                  })}
                </select>
              </div>
              <div className="flex flex-col w-fit">
                <button accessKey="S" type="submit" className="btn btn-accent">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
        {studentTableViewComp}
      </div>
      <NotificationAlert
        type={notification.type}
        message={notification.message}
        id={notification.id}
      />
    </DashboardContent>
  );
}
