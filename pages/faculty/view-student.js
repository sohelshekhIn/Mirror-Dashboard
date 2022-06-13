import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardContent } from "../../components/faculty/Navbar";
import Loading from "../../components/utilities/Loading";
import NotificationAlert from "../../components/utilities/NotificationAlert";

export default function ViewStudent() {
  const { status, data } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });
  if (status === "loading") {
    return <Loading />;
  }
  if (data.user && data.user.role !== "faculty") {
    return <PageNotFound />;
  }

  // == Main ==
  const [batch, setBatch] = useState({
    Loading: {
      batch: "Loading Batches...",
    },
  });
  const [formData, setFormData] = useState({
    class: null,
    batch: null,
    subjects: [],
  });
  const [notification, setNotification] = useState({
    message: null,
    type: "",
  });
  const [validationError, setValidationError] = useState(null);
  var classes = [];
  var batches = [];
  var subjects = [];

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
          tempBatch[res.data.data[key].id] = {
            batch: res.data.data[key].attributes.batch,
            subjects: res.data.data[key].attributes.subjects,
          };
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
  };
  console.log(formData);
  console.log(formData.subjects);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.class === "" || formData.class === "DEFAULT") {
      setValidationError("Please select a class");
      return;
    }
    axios
      .post(
        process.env.NEXT_PUBLIC_STRAPI_API + "/data/students/view",
        {
          data: formData,
        },
        {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        }
      )
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
        setNotification({
          message: err.message,
          type: "error",
          id: new Date(),
        });
      });
  };

  return (
    <DashboardContent>
      <div className="flex flex-col">
        <div className="flex flex-col">
          <div className="flex flex-col">
            <div className="flex flex-col">
              <h1 className="heading1 text-primary">View Student</h1>
              <span className="underline w-24 my-4"></span>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
              <div className="text-red-400 font-semibold text-md text-center rounded p-2">
                {validationError}
              </div>
              <div className="flex flex-col items-start md:flex-row  space-y-5 space-x-0 md:space-y-0 md:space-x-5">
                <div className="form-control md:mx-0 w-full max-w-xs">
                  <label className="label">
                    <span className="label-text">Select Class</span>
                  </label>
                  <select
                    id="selectBatch"
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
                <div className="form-control md:mx-0 w-full max-w-xs">
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
                    <option value="DEFAULT">Select Batch</option>
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
              <div className="w-full max-w-4xl">
                <label htmlFor="studsubjects" className="label">
                  <span className="label-text">Subjects</span>
                </label>
                {batches.map((singleBatch) => {
                  if (batch[singleBatch].batch === formData.batch) {
                    // for length of subjects in batch
                    let tempSubjects = batch[singleBatch].subjects;
                    tempSubjects.map((subject) => {
                      subjects.push(
                        <div
                          key={subject}
                          className="form-control my-2 mx-2 w-5/12 md:w-2/12"
                        >
                          <label className="label cursor-pointer">
                            <span className="label-text">{subject}</span>
                            <input
                              name="subjects"
                              type="checkbox"
                              id="subjectCheckBox"
                              value={subject}
                              onChange={handleChange}
                              className="subjectCheckBox checkbox"
                            />
                          </label>
                        </div>
                      );
                    });
                  }
                })}

                {subjects && subjects.length > 0 ? (
                  <div className="flex flex-wrap input py-4 h-fit input-bordered">
                    <div className="form-control my-2 mx-2 w-5/12 md:w-2/12">
                      <label className="label cursor-pointer">
                        <span className="label-text">Select All</span>
                        <input
                          name="subjects"
                          type="checkbox"
                          id="checkbox"
                          onChange={(e) => {
                            // set checked to true of all subjects
                            let subjectElems =
                              document.querySelectorAll(".subjectCheckBox");
                            let selectedSubjects = [];
                            if (e.target.checked) {
                              for (let i = 0; i < subjectElems.length; i++) {
                                subjectElems[i].checked = true;
                                selectedSubjects.push(subjectElems[i].value);
                              }
                            } else {
                              for (let i = 0; i < subjectElems.length; i++) {
                                subjectElems[i].checked = false;
                                selectedSubjects = [];
                              }
                            }
                            setFormData({
                              ...formData,
                              subjects: selectedSubjects,
                            });
                          }}
                          className="checkbox"
                        />
                      </label>
                    </div>
                    {subjects}
                  </div>
                ) : (
                  <div className="input flex py-4 h-fit input-bordered">
                    Select Batch to see Subjects
                  </div>
                )}
              </div>
              <div className="flex flex-col w-fit">
                <button type="submit" className="btn btn-accent">
                  Submit
                </button>
              </div>
            </form>
          </div>
          <div className="table"></div>
        </div>
        <div className="data section"></div>
      </div>
      <NotificationAlert
        message={notification.message}
        type={notification.type}
        id={notification.id}
      />
    </DashboardContent>
  );
}
