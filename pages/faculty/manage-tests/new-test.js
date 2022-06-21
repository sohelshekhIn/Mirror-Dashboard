import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { DashboardContent } from "../../../components/faculty/Navbar";
import DatePicker from "../../../components/utilities/DatePicker";
import Loading from "../../../components/utilities/Loading";
import NotificationAlert from "../../../components/utilities/NotificationAlert";
import { calendarPNG } from "../../../public/images";
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
    !data.user.facultyData["facultyRoles"].includes(17)
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
  const [students, setStudents] = useState();
  const [validationError, setValidationError] = useState(null);
  const [dropDownStatus, setDropDownStatus] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tableContentComp, setTableContentComp] = useState(null);
  var classes = [];
  var batches = [];

  const closeDatePicker = () => {
    document.getElementById("TestDatePickerToggle").checked = false;
  };

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
        setStudents(res.data);
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
        <div class="collapse collapse-arrow">
          <input type="checkbox" id="showFormCheckbox" />
          <div class="collapse-title p-0">
            <div className="flex flex-col">
              <h1 className="heading1 text-primary">Add New Test</h1>
              <span className="underline w-24 my-4"></span>
            </div>
          </div>
          <div class="collapse-content p-0">
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
                <button type="submit" className="btn btn-accent">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="flex flex-col space-y-16 px-5 py-10 lg:px-10 bg-white rounded-xl shadow-xl">
          <div className="flex flex-col xl:flex-row xl:space-x-5 xl:space-y-0 space-y-4 md:space-y-2 justify-between">
            <div class="form-control w-full max-w-xl flex flex-col space-y-8 md:space-y-2">
              <input
                type="text"
                placeholder="Test Title (60 characters max)"
                className="bg-white outline-none h-10 md:h-16 break-words w-full max-w-xl text-secondary font-semibold text-2xl md:text-3xl"
                name="title"
                maxLength="60"
              />
              <div class="form-control w-full max-w-xl">
                <input
                  type="number"
                  placeholder="Marks Out Of"
                  className="bg-white outline-none w-full max-w-xs text-secondary font-medium"
                  name="title"
                  maxLength="999"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <div className="form-control w-100 max-w-2xl md:max-w-md w-full">
                <div className="flex justify-between">
                  <input
                    id="dobDatePickerInput"
                    type="text"
                    name="dob"
                    placeholder="Test Date (DD/MM/YYYY)"
                    className="outline-none font-medium md:w-1/2 lg:w-full bg-transparent focus:input-bordered "
                  />
                  {useEffect(() => {
                    if (selectedDate !== null) {
                      console.log("Date", selectedDate);
                      closeDatePicker();
                    }
                  }, [selectedDate])}
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById(
                        "TestDatePickerToggle"
                      ).checked = true;
                    }}
                    className="p-2 bg-transparent"
                  >
                    <Image src={calendarPNG} />
                  </button>
                </div>
                <input
                  type="checkbox"
                  id="TestDatePickerToggle"
                  className="modal-toggle"
                />
                <div id="modal" className="modal modal-bottom sm:modal-middle">
                  <div className="modal-box bg-white">
                    <DatePicker
                      setSelectedDate={setSelectedDate}
                      minYearOnCalendar="10"
                      maxYearOnCalendar="0"
                      className="rounded-none shadow-none"
                    />
                    <div className="modal-footer mt-5">
                      <button
                        type="button"
                        onClick={() => {
                          document.getElementById(
                            "joinDatePickerToggle"
                          ).checked = false;
                        }}
                        className="btn btn-ghost w-full"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <span className="font-medium max-w-2xl">Chemistry</span>
            </div>
          </div>
          <div className="flex flex-col overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="studentTableTh">Sr.</th>
                  <th className="studentTableTh">Name</th>
                  <th className="studentTableTh">Present</th>
                  <th className="studentTableTh">Marks (Out of 100)</th>
                </tr>
              </thead>
              <tbody>
                {useEffect(() => {
                  console.log(students);
                  if (students && students.length > 0) {
                    let tempTableContentComp = [];
                    students.map((student, index) => {
                      tempTableContentComp.push(
                        <tr>
                          <td className="studentTableTh">{index + 1}</td>
                          <td className="studentTableTh">{student.name}</td>
                          <td className="studentTableTh">
                            <input
                              onClick={(e) => {
                                // if is not checked then disable mark input
                                if (!e.target.checked) {
                                  document.getElementById(
                                    `marks${index}`
                                  ).disabled = true;
                                } else {
                                  document.getElementById(
                                    `marks${index}`
                                  ).disabled = false;
                                }
                              }}
                              type="checkbox"
                              class="checkbox"
                            />
                          </td>
                          <td className="studentTableTh">
                            <input
                              id={`marks${index}`}
                              type="number"
                              placeholder={`Enter Marks for ${student.name}`}
                              class="input w-full md:w-3/4 max-w-xs"
                            />
                          </td>
                        </tr>
                      );
                      console.log(tempTableContentComp);
                    });
                    setTableContentComp(tempTableContentComp);
                  }
                }, [students])}
                {tableContentComp}
              </tbody>
            </table>
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
