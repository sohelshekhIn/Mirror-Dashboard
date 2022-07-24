import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { calendarPNG } from "../../public/images";
import DatePicker from "../utilities/DatePicker";

export default function StudentSubmissionsTableView({
  editStudentDetails,
  students,
  submissionDetails,
  setNotification,
  session,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [tableContentComp, setTableContentComp] = useState(null);
  const closeDatePicker = () => {
    document.getElementById("SubmissionDatePickerToggle").checked = false;
  };
  const router = useRouter();
  const [submittedData, setSubmittedData] = useState(null);
  const [validationError, setValidatonError] = useState(null);
  const [formData, setFormData] = useState({
    submissionTitle: null,
    submissionDate: null,
    submissionDetails: null,
  });
  const [batchInfoComps, setBatchInfoComps] = useState(null);
  // if editStudentDetails is true, then the form will be filled with the student's details
  useEffect(() => {
    if (editStudentDetails) {
      setFormData({
        submissionTitle:
          editStudentDetails.data.attributes.data.submissionTitle,
        submissionDate:
          editStudentDetails.data.attributes.SubmissionId.split("_")[2],
        submissionDetails:
          editStudentDetails.data.attributes.data.submissionDetails,
      });
    }
  }, [editStudentDetails]);

  const handleChange = (e) => {
    setValidatonError(null);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    console.log(formData);
    e.preventDefault();
    //   map data of input fields to an array
    let data = {};
    //   check is formData is empty
    if (formData.submissionTitle === null) {
      setValidatonError("Please fill Submission Title");
      return;
    }
    if (formData.submissionDate === null) {
      setValidatonError("Please fill Submission Date");
      return;
    }

    if (editStudentDetails) {
      let studentKeys = Object.keys(
        editStudentDetails.data.attributes.data.sdata
      );

      for (let i = 0; i < studentKeys.length; i++) {
        let student =
          editStudentDetails.data.attributes.data.sdata[studentKeys[i]];
        let notSubmitted = document.getElementById(`notSubmitted${i}`).checked;
        let remarks = document.getElementById(`remarks${i}`).value;

        if (notSubmitted) {
          data[studentKeys[i]] = [student[0], false];
        } else {
          remarks === "" ? (remarks = "Submitted") : remarks;
          data[studentKeys[i]] = [student[0], remarks];
        }
      }
    } else {
      for (let i = 0; i < students.length; i++) {
        let notSubmitted = document.getElementById(`notSubmitted${i}`).checked;

        let remarks = document.getElementById(`remarks${i}`).value;

        if (notSubmitted) {
          data[students[i].UserID] = [students[i].name, false];
        } else {
          remarks === "" ? (remarks = "Submitted") : remarks;
          data[students[i].UserID] = [students[i].name, remarks];
        }
      }
    }

    if (
      submittedData &&
      submittedData[0] === formData &&
      JSON.stringify(submittedData[1]) === JSON.stringify(data)
    ) {
      setNotification({
        type: "error",
        message: "Cannot submit same data twice",
        id: new Date(),
      });
      return;
    }

    if (validationError === null) {
      // join formData to data
      let userDetails = [session.user.id, session.user.name];

      let processedData = {
        sdata: { ...data },
        submissionTitle: formData.submissionTitle,
        submissionDetails: formData.submissionDetails,
        addedBy: userDetails,
      };

      if (editStudentDetails) {
        if (session.user.facultyData["facultyRoles"].includes(21)) {
          processedData["addedBy"] =
            editStudentDetails.data.attributes.data.addedBy;
          axios
            .put(
              process.env.NEXT_PUBLIC_STRAPI_API +
                "/submissions/" +
                editStudentDetails.data.id,
              {
                data: {
                  SubmissionId: `${
                    editStudentDetails.data.attributes.SubmissionId.split(
                      "_"
                    )[0]
                  }_${
                    editStudentDetails.data.attributes.SubmissionId.split(
                      "_"
                    )[1]
                  }_${formData.submissionDate}_${
                    Math.floor(Math.random() * 9999) + 1000
                  }`,
                  data: processedData,
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${session.user.accessToken}`,
                },
              }
            )
            .then((res) => {
              setSubmittedData([formData, data]);
              setNotification({
                type: "success",
                message: "Submission Updated Successfully",
                id: new Date(),
              });
              setTimeout(() => {
                router.back();
              }, 2000);
            })
            .catch((err) => {
              console.log(err);
              setNotification({
                type: "error",
                message: err.message,
                id: new Date(),
              });
            });
        } else {
          setNotification({
            type: "error",
            message: "You are not authorized to edit this test",
            id: new Date(),
          });
        }
      } else {
        axios
          .post(
            process.env.NEXT_PUBLIC_STRAPI_API + "/submissions",
            {
              data: {
                SubmissionId: `${submissionDetails.batch.replace(/\s/g, "")}_${
                  submissionDetails.subject
                }_${formData.submissionDate}_${
                  Math.floor(Math.random() * 9999) + 1000
                }`,
                data: processedData,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
              },
            }
          )
          .then((res) => {
            setSubmittedData([formData, data]);
            setNotification({
              type: "success",
              message: "Submission Added Successfully",
              id: new Date(),
            });
            setTimeout(() => {
              router.back();
            }, 2000);
          })
          .catch((err) => {
            console.log(err);
            setNotification({
              type: "error",
              message: err.message,
              id: new Date(),
            });
          });
      }
    }
  };

  // Data eg to send to server:
  //  BATCH_SUBJECT_TESTDATE_TOTALMARKS_RANDOMUID
  // "12NCERT_MATHS_23/06/2022_30_6241": {
  //   ST25551: ["Student Name", remarks/false (not submitted)],
  // },

  useEffect(() => {
    tableData();
  }, [students, editStudentDetails]);

  const tableData = () => {
    if (students && students.length > 0) {
      let tempTableContentComp = [];
      students.map((student, index) => {
        tempTableContentComp.push(
          <tr key={index}>
            <td className="studentTableTh">{index + 1}</td>
            <td className="studentTableTh">{student.name}</td>
            <td className="studentTableTh">
              <input
                id={`notSubmitted${index}`}
                onClick={(e) => {
                  // if is not checked then disable mark input
                  if (!e.target.checked) {
                    document.getElementById(`remarks${index}`).disabled = false;
                  } else {
                    document.getElementById(`remarks${index}`).disabled = true;
                  }
                }}
                type="checkbox"
                onChange={(e) => {
                  setValidatonError(null);
                }}
                className="checkbox"
              />
            </td>
            <td className="studentTableTh">
              <textarea
                name={student.UserID}
                class="textarea"
                id={`remarks${index}`}
                onChange={() => {
                  setValidatonError(null);
                }}
                placeholder={`Remarks for ${student.name}`}
              ></textarea>
              {/* <input
                name={student.UserID}
                id={`remarks${index}`}
                type="number"
                onChange={() => {
                  setValidatonError(null);
                }}
                placeholder={`Enter Marks for ${student.name}`}
                class="input w-full md:w-3/4 max-w-xs"
              /> */}
            </td>
          </tr>
        );
      });
      setTableContentComp(tempTableContentComp);
    } else if (editStudentDetails) {
      let tempTableContentComp = [];
      //   editStudentDetails.data.attributes.data.sdata.map((student, index) => {
      let studentKeys = Object.keys(
        editStudentDetails.data.attributes.data.sdata
      );
      for (
        let i = 0;
        i < Object.keys(editStudentDetails.data.attributes.data.sdata).length;
        i++
      ) {
        let student =
          editStudentDetails.data.attributes.data.sdata[studentKeys[i]];
        tempTableContentComp.push(
          <tr key={i}>
            <td className="studentTableTh">{i + 1}</td>
            <td className="studentTableTh">{student[0]}</td>
            <td className="studentTableTh">
              <input
                id={`notSubmitted${i}`}
                onClick={(e) => {
                  // if is not checked then disable mark input
                  if (!e.target.checked) {
                    document.getElementById(`remarks${i}`).disabled = false;
                  } else {
                    document.getElementById(`remarks${i}`).disabled = true;
                  }
                }}
                type="checkbox"
                onChange={(e) => {
                  setValidatonError(null);
                }}
                className="checkbox"
              />
            </td>
            <td className="studentTableTh">
              <textarea
                class="textarea"
                id={`remarks${i}`}
                onChange={() => {
                  setValidatonError(null);
                }}
                placeholder={`Remarks for ${student[0]}`}
              ></textarea>
              {/* <input
                name={"je"}
                id={`remarks${i}`}
                type="number"
                onChange={() => {
                  setValidatonError(null);
                }}
                placeholder={`Enter Marks for ${student[0]}`}
                class="input w-full md:w-3/4 max-w-xs"
              /> */}
            </td>
          </tr>
        );
      }
      setTableContentComp(tempTableContentComp);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col space-y-16 px-5 py-10 lg:px-10 bg-white rounded-xl shadow-xl">
        {/* if validationError is there then show error */}
        {validationError && (
          <div className="text-red-500 text-center font-semibold">
            {validationError}
          </div>
        )}
        <div className="flex flex-col xl:flex-row xl:space-x-5 xl:space-y-0 space-y-4 md:space-y-2 justify-between">
          <div class="form-control w-full max-w-xl flex flex-col space-y-8 md:space-y-2">
            <input
              type="text"
              onChange={handleChange}
              value={formData.submissionTitle}
              placeholder="Submission Title (60 characters max)"
              className="bg-white outline-none h-10 md:h-16 break-words w-full max-w-xl text-secondary font-semibold text-2xl md:text-3xl"
              name="submissionTitle"
              maxLength="60"
            />
          </div>
          <div className="flex flex-col space-y-4">
            <div className="form-control w-100 max-w-2xl md:max-w-md w-full">
              <div className="flex justify-between">
                <input
                  type="text"
                  name="submissionDate"
                  value={formData.submissionDate}
                  onChange={handleChange}
                  maxLength="10"
                  placeholder="Submission Date (DD/MM/YYYY)"
                  className="outline-none focus:input input-bordered font-medium md:w-1/2 lg:w-full bg-transparent focus:input-bordered "
                />
                {useEffect(() => {
                  if (selectedDate !== null) {
                    setFormData({
                      ...formData,
                      submissionDate: selectedDate,
                    });
                    closeDatePicker();
                  }
                }, [selectedDate])}
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById(
                      "SubmissionDatePickerToggle"
                    ).checked = true;
                  }}
                  className="p-2 bg-transparent"
                >
                  <Image src={calendarPNG} />
                </button>
              </div>
              <input
                type="checkbox"
                id="SubmissionDatePickerToggle"
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
                          "SubmissionDatePickerToggle"
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

            {useEffect(() => {
              if (editStudentDetails) {
                let batch =
                  editStudentDetails.data.attributes.SubmissionId.split("_")[0];
                if (isNaN(parseInt(batch[1]))) {
                  batch = batch.slice(0, 1) + " " + batch.slice(1);
                } else if (isNaN(parseInt(batch[2]))) {
                  batch = batch.slice(0, 2) + " " + batch.slice(2);
                }
                setBatchInfoComps(
                  <span className="font-medium max-w-2xl">
                    {batch} (
                    {
                      editStudentDetails.data.attributes.SubmissionId.split(
                        "_"
                      )[1]
                    }
                    )
                  </span>
                );
              } else {
                console.log(submissionDetails);
                setBatchInfoComps(
                  <span className="font-medium max-w-2xl">
                    {submissionDetails.batch} ({submissionDetails.subject})
                  </span>
                );
              }
            }, [editStudentDetails, submissionDetails])}
            {batchInfoComps}
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          <textarea
            class="textarea"
            placeholder="Submission Details"
            maxLength="500"
            name="submissionDetails"
            onChange={handleChange}
            value={formData.submissionDetails}
          ></textarea>
        </div>
        <div className="flex flex-col overflow-x-auto space-y-10">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="studentTableTh">Sr.</th>
                <th className="studentTableTh">Name</th>
                <th className="studentTableTh">Not Submitted</th>
                <th className="studentTableTh">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {tableContentComp}
              {useEffect(() => {
                if (editStudentDetails) {
                  let studentKeys = Object.keys(
                    editStudentDetails.data.attributes.data.sdata
                  );

                  for (let j = 0; j < studentKeys.length; j++) {
                    let student =
                      editStudentDetails.data.attributes.data.sdata[
                        studentKeys[j]
                      ];
                    if (student[1] === false) {
                      document.getElementById(`notSubmitted${j}`)
                        ? (document.getElementById(
                            `notSubmitted${j}`
                          ).checked = true)
                        : "";
                      document.getElementById(`remarks${j}`)
                        ? (document.getElementById(
                            `remarks${j}`
                          ).disabled = true)
                        : "";
                    } else {
                      document.getElementById(`remarks${j}`)
                        ? (document.getElementById(`remarks${j}`).value =
                            student[1])
                        : "";
                      document.getElementById(`remarks${j}`)
                        ? (document.getElementById(
                            `remarks${j}`
                          ).disabled = false)
                        : "";
                    }
                  }
                }
              }, [tableContentComp])}
            </tbody>
          </table>
        </div>
        <div className="w-full flex justify-end space-x-5">
          {editStudentDetails ? (
            <button
              tabIndex="-1"
              type="button"
              onClick={() => {
                //   alaert asking if user wants to save the changes
                if (
                  session.user.facultyData["facultyRoles"].includes(19) &&
                  window.confirm(
                    "Are you sure you want to delete this submission?"
                  )
                ) {
                  axios
                    .delete(
                      process.env.NEXT_PUBLIC_STRAPI_API +
                        "/submissions/" +
                        editStudentDetails.data.id,
                      {
                        headers: {
                          Authorization: `Bearer ${session.user.accessToken}`,
                        },
                      }
                    )
                    .then((res) => {
                      setNotification({
                        type: "success",
                        message: "Submission deleted successfully",
                        id: new Date(),
                      });
                      setTimeout(() => {
                        router.back();
                      }, 2000);
                    })
                    .catch((err) => {
                      setNotification({
                        type: "error",
                        message: err.message,
                        id: new Date(),
                      });
                    });
                }
              }}
              className="btn btn-ghost text-error bg-transparent"
            >
              Delete
            </button>
          ) : (
            ""
          )}
          <button type="submit" className="btn btn-accent">
            Submit
          </button>
        </div>
      </div>
    </form>
  );
}
