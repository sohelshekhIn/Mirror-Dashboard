import { DashboardContent } from "../../components/faculty/Navbar";
import * as Yup from "yup";
import { Formik, Field } from "formik";
import { signIn, useSession } from "next-auth/react";
import Loading from "../../components/utilities/Loading";
import PageNotFound from "../404";
import { useEffect, useState } from "react";
import DatePicker from "../../components/utilities/DatePicker";
import Image from "next/image";
import { calendarPNG } from "../../public/images";
import axios from "axios";
import NotificationAlert from "../../components/utilities/NotificationAlert";
import { useRouter } from "next/router";

export default function RegisterStudent() {
  // Page Authentication Checker
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

  // Main Code
  const [validationError, setValidationError] = useState(null);
  const [selectedJoinDate, setSelectedJoinDate] = useState(null);
  const [selectedDOB, setSelectedDOB] = useState(null);
  const [notification, setNotification] = useState({
    message: null,
    type: null,
  });
  const [batch, setBatch] = useState({
    Loading: {
      batch: "Loading Batches...",
    },
  });
  const [subjects, setSubjects] = useState([]);
  const [submittedData, setSubmittedData] = useState({});

  const router = useRouter();

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        closeDatePicker();
      }
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // useEffect(() => {
  //   if (selectedJoinDate != null) {
  //     document.getElementById("joinDatePickerInput").value = selectedJoinDate;
  //   }
  //   if (selectedDOB != null) {
  //     document.getElementById("dobDatePickerInput").value = selectedDOB;
  //   }
  //   closeDatePicker();
  // }, [selectedJoinDate, selectedDOB]);

  const closeDatePicker = () => {
    document.getElementById("joinDatePickerToggle").checked = false;
    document.getElementById("dobDatePickerToggle").checked = false;
  };

  // Get Batches
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
        console.log(err);
        if (err.message) {
          setNotification({
            message: err.message,
            type: "error",
            id: new Date(),
          });
        }
        console.log(err);
      });
  }, []);

  return (
    <DashboardContent>
      <div className="flex flex-col">
        <div className="flex flex-col">
          <h1 className="heading1 text-primary">Register Student</h1>
          <span className="underline w-32 my-4"></span>
        </div>
        <div className="flex flex-col">
          <div className="text-red-400 font-semibold text-md text-center rounded p-2">
            {validationError}
          </div>
          <Formik
            initialValues={{
              name: "",
              gender: "",
              school: "",
              batch: "",
              subjects: "",
              joinDate: "",
              dob: "",
              fatherName: "",
              motherName: "",
              fatherMobile: "",
              motherMobile: "",
              msgMobile: "",
              active: true,
              canLogin: true,
            }}
            validationSchema={Yup.object({
              name: Yup.string()
                .required("Name is required")
                .min(3, "Name must be atleast 3 characters"),
              gender: Yup.string()
                .required("Gender is Required")
                .notOneOf(["DEFAULT"], "Select Gender"),
              // Using Yup check if value is not DEFAULT
              school: Yup.string()
                .required("School Name is required")
                .notOneOf(["DEFAULT"], "Select School"),
              batch: Yup.string()
                .required("Batch is required")
                .notOneOf(["DEFAULT"], "Select Gender"),
              subjects: Yup.array()
                .required("Subjects is required")
                .min(1, "Select atleast one subject"),
              joinDate: Yup.string().required("Join Date is required"),
              dob: Yup.string().required("Date of Birth is required"),
              fatherName: Yup.string()
                .required("Father Name is required")
                .min(3, "Father Name must be atleast 3 characters"),
              motherName: Yup.string()
                .required("Mother Name is required")
                .min(3, "Mother Name must be atleast 3 characters"),
              fatherMobile: Yup.number("Father Mobile must be a number")
                .required("Father Mobile is required")
                .min(10, "Father Mobile must be atleast 10 digits"),
              motherMobile: Yup.number()
                .required("Mother Mobile is required")
                .min(10, "Mother Mobile must be atleast 10 digits"),
              msgMobile: Yup.number()
                .required("Message Mobile is required")
                .min(10, "Message Mobile must be atleast 10 digits"),
              active: Yup.bool().required("Mirror Student is required"),
              canLogin: Yup.bool().required("Can Login is required"),
            })}
            onSubmit={async (values, { setSubmitting }) => {
              if (submittedData !== values) {
                console.log(values);
                // axios post data to /data/students/register
                axios
                  .post(
                    process.env.NEXT_PUBLIC_STRAPI_API +
                      "/data/students/register",
                    {
                      data: {
                        name: values.name,
                        batch: values.batch,
                        subjects: values.subjects,
                        gender: values.gender,
                        fatherName: values.fatherName,
                        motherName: values.motherName,
                        fatherMobile: values.fatherMobile,
                        motherMobile: values.motherMobile,
                        msgMobile: values.msgMobile,
                        joinDate: values.joinDate,
                        dob: values.dob,
                        blocked: values.active,
                        canLogin: values.canLogin,
                        school: values.school,
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
                      message: "Student Registered Successfully",
                      type: "success",
                      id: new Date(),
                    });
                    setSubmitting(false);
                    setSubmittedData(values);
                    // Empty all the fields
                    router.reload();
                  })
                  .catch((err) => {
                    setNotification({
                      message: "Student Registration Failed: " + err,
                      type: "error",
                      id: new Date(),
                    });
                  });
              } else {
                setNotification({
                  message: "Cannot Register Same Data",
                  type: "error",
                  id: new Date(),
                });
              }
            }}
          >
            {(formik) => (
              <form className="flex flex-col" onSubmit={formik.handleSubmit}>
                {/* Handle Formik Validation Errors */}

                {setValidationError(null)}
                {formik.errors.name &&
                  formik.touched.name &&
                  setValidationError(formik.errors.name)}
                {formik.errors.gender &&
                  formik.touched.gender &&
                  setValidationError(formik.errors.gender)}
                {formik.errors.school &&
                  formik.touched.school &&
                  setValidationError(formik.errors.school)}
                {formik.errors.batch &&
                  formik.touched.batch &&
                  setValidationError(formik.errors.batch)}
                {formik.errors.subjects &&
                  formik.touched.subjects &&
                  setValidationError(formik.errors.subjects)}
                {formik.errors.joinDate &&
                  formik.touched.joinDate &&
                  setValidationError(formik.errors.joinDate)}
                {formik.errors.dob &&
                  formik.touched.dob &&
                  setValidationError(formik.errors.dob)}
                {formik.errors.fatherName &&
                  formik.touched.fatherName &&
                  setValidationError(formik.errors.fatherName)}
                {formik.errors.motherName &&
                  formik.touched.motherName &&
                  setValidationError(formik.errors.motherName)}
                {formik.errors.fatherMobile &&
                  formik.touched.fatherMobile &&
                  setValidationError(formik.errors.fatherMobile)}
                {formik.errors.motherMobile &&
                  formik.touched.motherMobile &&
                  setValidationError(formik.errors.motherMobile)}
                {formik.errors.msgMobile &&
                  formik.touched.msgMobile &&
                  setValidationError(formik.errors.msgMobile)}
                {formik.errors.active &&
                  formik.touched.active &&
                  setValidationError(formik.errors.active)}
                {formik.errors.canLogin &&
                  formik.touched.canLogin &&
                  setValidationError(formik.errors.canLogin)}
                {/* Handle Formik Values */}

                <div className="flex flex-wrap flex-col md:flex-row space-y-5 md:space-y-0">
                  {/* <div className="flex flex-wrap md:w-12/12 space-y-5 md:space-y-0"> */}
                  {/* --- Skipped --- */}
                  {/* Photo Upload section md:w-9/12 changed to md:w-12/12 */}
                  <div className="flex flex-col space-y-5 w-full md:w-1/2 md:pr-5">
                    <div className="form-control w-100 max-w-2xl md:max-w-md w-full">
                      <label htmlFor="name" className="label">
                        <span className="label-text">Student Name</span>
                      </label>
                      <Field
                        type="text"
                        name="name"
                        placeholder="Enter Student Name"
                        className="input input-bordered w-full max-w-full"
                      />
                    </div>
                    <div className="form-control w-100 max-w-2xl md:max-w-md w-full">
                      <label htmlFor="gender" className="label">
                        <span className="label-text">Gender</span>
                      </label>
                      <select
                        value={formik.values.gender}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        name="gender"
                        id="gender"
                        className="select select-bordered"
                      >
                        <option value="DEFAULT">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="form-control w-100 max-w-2xl md:max-w-md w-full">
                      <label htmlFor="school" className="label">
                        <span className="label-text">School</span>
                      </label>
                      <select
                        id="school"
                        name="school"
                        value={formik.values.school}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="select select-bordered"
                      >
                        <option value="DEFAULT">Select School</option>
                        <option>Bharatiya Vidya Bhavans</option>
                        <option>Vrajbhoomi International</option>
                        <option>Podar International</option>
                        <option>Euro / Altius Foritious</option>
                        <option>ETS CBSE</option>
                        <option>Zen School</option>
                        <option>Vibrant International</option>
                        <option>SNV International</option>
                        <option>St.Anne's School</option>
                        <option>St.Marry's School</option>
                        <option>Unique School</option>
                        <option>Mother Care</option>
                        <option>ETS GSEB</option>
                        <option>Santram English</option>
                        <option>Shrishti English</option>
                      </select>
                    </div>
                    <div className="form-control w-100 max-w-2xl md:max-w-md w-full">
                      <label htmlFor="batch" className="label">
                        <span className="label-text">Batch</span>
                      </label>
                      <select
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.batch}
                        id="batch"
                        name="batch"
                        className="select select-bordered"
                      >
                        <option value="DEFAULT">Select Batch</option>
                        {/* for every key of batch  */}
                        {Object.keys(batch).map((key) => {
                          if (key === "Loading") {
                            return (
                              <option disabled key={key} value={key}>
                                {batch[key].batch}
                              </option>
                            );
                          }
                          return (
                            <option key={key} value={key}>
                              {batch[key].batch}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="w-100 max-w-2xl md:max-w-md w-full">
                      <label htmlFor="studsubjects" className="label">
                        <span className="label-text">Subjects</span>
                      </label>

                      {useEffect(() => {
                        if (
                          formik.values.batch &&
                          formik.values.batch !== "DEFAULT"
                        ) {
                          const subjects = batch[formik.values.batch].subjects;
                          let subjectsAppendedCount = 0;
                          var subjectsDivHorizontal = [];
                          let subjectInputGroup = [];
                          for (let i = 0; i < subjects.length; i++) {
                            if (
                              subjectsAppendedCount !== 0 &&
                              subjectsAppendedCount % 2 === 0
                            ) {
                              subjectsDivHorizontal.push(
                                <div className="flex space-x-10">
                                  {subjectInputGroup}
                                </div>
                              );
                              subjectInputGroup = [];
                            }
                            subjectInputGroup.push(
                              <div
                                key={i + subjects[i]}
                                className="form-control w-5/12"
                              >
                                <label className="label cursor-pointer">
                                  <span className="label-text">
                                    {subjects[i]}
                                  </span>
                                  <Field
                                    name="subjects"
                                    type="checkbox"
                                    id="checkbox"
                                    value={subjects[i]}
                                    className="checkbox"
                                  />
                                </label>
                              </div>
                            );
                            if (subjectsAppendedCount === subjects.length - 1) {
                              subjectsDivHorizontal.push(
                                <div className="flex space-x-10">
                                  {subjectInputGroup}
                                </div>
                              );
                            }
                            subjectsAppendedCount++;
                          }
                          setSubjects(subjectsDivHorizontal);
                        }
                      }, [formik.values.batch])}

                      {subjects && subjects.length > 0 ? (
                        <div className="input flex-col space-y-4 py-4 h-fit input-bordered">
                          {subjects}
                        </div>
                      ) : (
                        <div className="input flex py-4 h-fit input-bordered">
                          Select Batch to see Subjects
                        </div>
                      )}
                      {/* <div className="form-control w-5/12">
                        <label className="label cursor-pointer">
                          <span className="label-text">Biology</span>
                          <Field
                            name="subjects"
                            type="checkbox"
                            id="checkbox"
                            value="Biology"
                            className="checkbox"
                          />
                        </label>
                      </div> */}
                    </div>
                    <div className="form-control w-100 max-w-2xl md:max-w-md w-full">
                      <label className="label">
                        <span className="label-text">Joining Date</span>
                      </label>
                      <div className="input input-bordered flex justify-between">
                        <input
                          id="joinDatePickerInput"
                          type="text"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.joinDate}
                          name="joinDate"
                          placeholder="Select Date (DD/MM/YY)"
                          className="outline-none bg-transparent"
                        />
                        {useEffect(() => {
                          if (selectedDOB !== null) {
                            formik.setFieldValue("joinDate", selectedJoinDate);
                            closeDatePicker();
                          }
                        }, [selectedJoinDate])}

                        <button
                          type="button"
                          onClick={() => {
                            document.getElementById(
                              "joinDatePickerToggle"
                            ).checked = true;
                          }}
                          className="p-2 bg-transparent"
                        >
                          <Image src={calendarPNG} />
                        </button>
                      </div>
                      <input
                        type="checkbox"
                        id="joinDatePickerToggle"
                        className="modal-toggle"
                      />
                      <div
                        id="modal"
                        className="modal modal-bottom sm:modal-middle"
                      >
                        <div className="modal-box bg-white">
                          <DatePicker
                            setSelectedDate={setSelectedJoinDate}
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
                  </div>
                  <div className="flex flex-col space-y-5 w-full md:w-1/2 md:pl-5">
                    <div className="form-control w-100 max-w-2xl md:max-w-md w-full">
                      <label className="label">
                        <span className="label-text">Date of Birth</span>
                      </label>
                      <div className="input input-bordered flex justify-between">
                        <input
                          id="dobDatePickerInput"
                          type="text"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.dob}
                          name="dob"
                          placeholder="Select Date (DD/MM/YY)"
                          className="outline-none bg-transparent"
                        />
                        {useEffect(() => {
                          if (selectedDOB !== null) {
                            formik.setFieldValue("dob", selectedDOB);
                            closeDatePicker();
                          }
                        }, [selectedDOB])}
                        <button
                          type="button"
                          onClick={() => {
                            document.getElementById(
                              "dobDatePickerToggle"
                            ).checked = true;
                          }}
                          className="p-2 bg-transparent"
                        >
                          <Image src={calendarPNG} />
                        </button>
                      </div>
                      <input
                        type="checkbox"
                        id="dobDatePickerToggle"
                        className="modal-toggle"
                      />
                      <div
                        id="modal"
                        className="modal modal-bottom sm:modal-middle"
                      >
                        <div className="modal-box bg-white">
                          <DatePicker
                            setSelectedDate={setSelectedDOB}
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
                    <div className="form-control w-100 max-w-2xl md:max-w-md w-full">
                      <label htmlFor="fatherName" className="label">
                        <span className="label-text">Father Name</span>
                      </label>
                      <input
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.fatherName}
                        name="fatherName"
                        aria-label="Enter Father Name"
                        placeholder="Enter Father Name"
                        className="input input-bordered w-full max-w-full"
                      />
                    </div>
                    <div className="form-control w-100 max-w-2xl md:max-w-md w-full">
                      <label htmlFor="motherName" className="label">
                        <span className="label-text">Mother Name</span>
                      </label>
                      <input
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.motherName}
                        name="motherName"
                        aria-label="Enter Mother Name"
                        placeholder="Enter Mother Name"
                        className="input input-bordered w-full max-w-full"
                      />
                    </div>
                    <div className="form-control w-100 max-w-2xl md:max-w-md w-full">
                      <label htmlFor="fatherMobile" className="label">
                        <span className="label-text">Father Mobile No.</span>
                      </label>
                      <input
                        type="tel"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.fatherMobile}
                        name="fatherMobile"
                        aria-label="Enter Father Mobile No."
                        placeholder="Enter Father Mobile No."
                        className="input input-bordered w-full max-w-full"
                      />
                    </div>
                    <div className="form-control w-100 max-w-2xl md:max-w-md w-full">
                      <label htmlFor="motherMobile" className="label">
                        <span className="label-text">Mother Mobile No.</span>
                      </label>
                      <input
                        type="tel"
                        // if msgMobile is "" then set msgMobile to motherMobile
                        onChange={(e) => {
                          if (
                            formik.values.msgMobile == "" ||
                            formik.values.msgMobile ==
                              formik.values.motherMobile
                          ) {
                            // set msgMobile to motherMobile
                            formik.setFieldValue("msgMobile", e.target.value);
                          }
                          formik.handleChange(e);
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.motherMobile}
                        name="motherMobile"
                        aria-label="Enter Mother Mobile No."
                        placeholder="Enter Mother Mobile No."
                        className="input input-bordered w-full max-w-full"
                      />
                    </div>
                    <div className="form-control w-100 max-w-2xl md:max-w-md w-full">
                      <label htmlFor="msgMobile" className="label">
                        <span className="label-text">Message Mobile No.</span>
                      </label>
                      <input
                        type="tel"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.msgMobile}
                        name="msgMobile"
                        aria-label="Enter Message Mobile No."
                        placeholder="Enter Message Mobile No."
                        className="input input-bordered w-full max-w-full"
                      />
                    </div>
                    {/* <div className="form-control w-100 max-w-2xl md:max-w-md w-full">
                      <label className="label cursor-pointer">
                        <span className="label-text">Mirror Student?</span>
                        <input
                          type="checkbox"
                          id="checkbox"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.active}
                          name="active"
                          checked={formik.values.active}
                          className="checkbox"
                        />
                      </label>
                    </div>
                    <div className="form-control w-100 max-w-2xl md:max-w-md w-full">
                      <label className="label cursor-pointer">
                        <span className="label-text">Can Login?</span>
                        <input
                          name="canLogin"
                          onClick={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.canLogin}
                          type="checkbox"
                          id="checkbox"
                          checked={formik.values.canLogin}
                          className="checkbox"
                        />
                      </label>
                    </div> */}
                  </div>
                  {/* </div> */}
                  {/* Photo Upload Section  ---Skipped --- */}
                  {/* <div className="flex flex-col w-3/12 pl-5">
                <h1 className="label">Photo</h1>
                <div className="form-control w-100 max-w-2xl md:max-w-md w-full">
                  <Image />
                  <input
                    type="file"
                    name="avatarUpload"
                    id="avatarUpload"
                    className="hidden"
                  />
                  <label htmlFor="avatarUpload" className="btn btn-ghost">
                    Upload Custom
                  </label>
                </div>
              </div> */}
                </div>
                <div className="form-control mx-auto py-10 max-w-2xl md:max-w-md w-full">
                  <button
                    accessKey="S"
                    type="submit"
                    className="btn btn-accent"
                  >
                    {/* based on submitting  */}
                    {formik.isSubmitting ? "Please wait..." : "Submit"}
                  </button>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
      <NotificationAlert
        message={notification.message}
        type={notification.type}
      />
    </DashboardContent>
  );
}
