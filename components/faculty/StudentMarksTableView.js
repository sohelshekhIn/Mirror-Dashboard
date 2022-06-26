import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { calendarPNG } from "../../public/images";
import DatePicker from "../utilities/DatePicker";

export default function StudentMarksTableView({
  editStudentDetails,
  students,
  testDetails,
  setNotification,
  session,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [tableContentComp, setTableContentComp] = useState(null);
  const closeDatePicker = () => {
    document.getElementById("TestDatePickerToggle").checked = false;
  };
  const router = useRouter();
  const [submittedData, setSubmittedData] = useState(null);
  const [validationError, setValidatonError] = useState(null);
  const [formData, setFormData] = useState({
    testTitle: null,
    testDate: null,
    marksOutOf: null,
  });
  const [batchInfoComps, setBatchInfoComps] = useState(null);
  // if editStudentDetails is true, then the form will be filled with the student's details
  useEffect(() => {
    if (editStudentDetails) {
      setFormData({
        testTitle: editStudentDetails.data.attributes.data.testTitle,
        testDate: editStudentDetails.data.attributes.TestId.split("_")[2],
        marksOutOf: editStudentDetails.data.attributes.TestId.split("_")[3],
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
    e.preventDefault();
    //   map data of input fields to an array
    let data = {};
    //   check is formData is empty
    if (formData.testTitle === null) {
      setValidatonError("Please fill Test Title");
      return;
    }
    if (formData.testDate === null) {
      setValidatonError("Please fill Test Date");
      return;
    }
    if (formData.marksOutOf === null) {
      setValidatonError("Please fill Total Marks (Out Of)");
      return;
    }

    if (editStudentDetails) {
      let studentKeys = Object.keys(
        editStudentDetails.data.attributes.data.tdata
      );

      for (let i = 0; i < studentKeys.length; i++) {
        let student =
          editStudentDetails.data.attributes.data.tdata[studentKeys[i]];
        let isAbsent = document.getElementById(`isAbsent${i}`).checked;
        let marks = document.getElementById(`marks${i}`).value;
        if (marks === "" && isAbsent === false) {
          setValidatonError(
            `Please fill Marks or select Absent for ${students[i].name}`
          );
          return;
        } else {
          if (isAbsent) {
            data[studentKeys[i]] = [student[0], false];
          } else {
            data[studentKeys[i]] = [student[0], marks];
          }
        }
      }
    } else {
      for (let i = 0; i < students.length; i++) {
        let isAbsent = document.getElementById(`isAbsent${i}`).checked;
        let marks = document.getElementById(`marks${i}`).value;
        if (marks === "" && isAbsent === false) {
          setValidatonError(
            `Please fill Marks or select Absent for ${students[i].name}`
          );
          return;
        } else {
          if (isAbsent) {
            data[students[i].UserID] = [students[i].name, false];
          } else {
            data[students[i].UserID] = [students[i].name, marks];
          }
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

      // punishment data in format of  object with array [from , to, punishment]
      let punishmentData = {
        1: [
          document.getElementById("lowKey1").value,
          document.getElementById("highKey1").value,
          document.getElementById("pKey1").value,
        ],
        2: [
          document.getElementById("lowKey2").value,
          document.getElementById("highKey2").value,
          document.getElementById("pKey2").value,
        ],
        3: [
          document.getElementById("lowKey3").value,
          document.getElementById("highKey3").value,
          document.getElementById("pKey3").value,
        ],
        4: [
          document.getElementById("lowKey4").value,
          document.getElementById("highKey4").value,
          document.getElementById("pKey4").value,
        ],
      };

      // if every key value of punishmentData is empty then ask user if they want to conutinue
      let numberOfEmptyPunishments = 0;
      Object.keys(punishmentData).map((key) => {
        if (punishmentData[key][0] === "") {
          numberOfEmptyPunishments++;
        }
      });
      if (numberOfEmptyPunishments === 3) {
        if (
          !window.confirm("Do you want to continue wihtout adding punishments?")
        ) {
          return;
        }
      }

      let processedData = {
        tdata: { ...data },
        pdata: punishmentData,
        testTitle: formData.testTitle,
        addedBy: userDetails,
      };

      if (editStudentDetails) {
        if (session.user.facultyData["testsData"].canEdit) {
          axios
            .put(
              process.env.NEXT_PUBLIC_STRAPI_API +
                "/marks/" +
                editStudentDetails.data.id,
              {
                data: {
                  TestId: `${
                    editStudentDetails.data.attributes.TestId.split("_")[0]
                  }_${
                    editStudentDetails.data.attributes.TestId.split("_")[1]
                  }_${formData.testDate}_${formData.marksOutOf}_${
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
                message: "Test Marks Updated Successfully",
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
            process.env.NEXT_PUBLIC_STRAPI_API + "/marks",
            {
              data: {
                TestId: `${testDetails.batch.replace(/\s/g, "")}_${
                  testDetails.subject
                }_${formData.testDate}_${formData.marksOutOf}_${
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
              message: "Test Marks Added Successfully",
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
  //   ST25551: ["Student Name", marks/false]
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
                id={`isAbsent${index}`}
                onClick={(e) => {
                  // if is not checked then disable mark input
                  if (!e.target.checked) {
                    document.getElementById(`marks${index}`).disabled = false;
                  } else {
                    document.getElementById(`marks${index}`).disabled = true;
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
              <input
                name={student.UserID}
                id={`marks${index}`}
                type="number"
                onChange={() => {
                  setValidatonError(null);
                }}
                placeholder={`Enter Marks for ${student.name}`}
                class="input w-full md:w-3/4 max-w-xs"
              />
            </td>
          </tr>
        );
      });
      setTableContentComp(tempTableContentComp);
    } else if (editStudentDetails) {
      let tempTableContentComp = [];
      //   editStudentDetails.data.attributes.data.tdata.map((student, index) => {
      let studentKeys = Object.keys(
        editStudentDetails.data.attributes.data.tdata
      );
      for (
        let i = 0;
        i < Object.keys(editStudentDetails.data.attributes.data.tdata).length;
        i++
      ) {
        let student =
          editStudentDetails.data.attributes.data.tdata[studentKeys[i]];
        tempTableContentComp.push(
          <tr key={i}>
            <td className="studentTableTh">{i + 1}</td>
            <td className="studentTableTh">{student[0]}</td>
            <td className="studentTableTh">
              <input
                id={`isAbsent${i}`}
                onClick={(e) => {
                  // if is not checked then disable mark input
                  if (!e.target.checked) {
                    document.getElementById(`marks${i}`).disabled = false;
                  } else {
                    document.getElementById(`marks${i}`).disabled = true;
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
              <input
                name={"je"}
                id={`marks${i}`}
                type="number"
                onChange={() => {
                  setValidatonError(null);
                }}
                placeholder={`Enter Marks for ${student[0]}`}
                class="input w-full md:w-3/4 max-w-xs"
              />
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
              value={formData.testTitle}
              placeholder="Test Title (60 characters max)"
              className="bg-white outline-none h-10 md:h-16 break-words w-full max-w-xl text-secondary font-semibold text-2xl md:text-3xl"
              name="testTitle"
              maxLength="60"
            />

            <div class="form-control w-1/2">
              <input
                type="number"
                placeholder="Marks Out Of"
                onChange={handleChange}
                value={formData.marksOutOf}
                className="bg-white focus:input input-bordered outline-none w-full max-w-xs text-secondary font-medium"
                name="marksOutOf"
                maxLength="999"
              />
            </div>
          </div>
          <div className="flex flex-col space-y-4">
            <div className="form-control w-100 max-w-2xl md:max-w-md w-full">
              <div className="flex justify-between">
                <input
                  type="text"
                  name="testDate"
                  value={formData.testDate}
                  onChange={handleChange}
                  placeholder="Test Date (DD/MM/YYYY)"
                  className="outline-none focus:input input-bordered font-medium md:w-1/2 lg:w-full bg-transparent focus:input-bordered "
                />
                {useEffect(() => {
                  if (selectedDate !== null) {
                    setFormData({
                      ...formData,
                      testDate: selectedDate,
                    });
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
                          "TestDatePickerToggle"
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
                  editStudentDetails.data.attributes.TestId.split("_")[0];
                if (isNaN(parseInt(batch[1]))) {
                  batch = batch.slice(0, 1) + " " + batch.slice(1);
                } else if (isNaN(parseInt(batch[2]))) {
                  batch = batch.slice(0, 2) + " " + batch.slice(2);
                }
                setBatchInfoComps(
                  <span className="font-medium max-w-2xl">
                    {batch} (
                    {editStudentDetails.data.attributes.TestId.split("_")[1]})
                  </span>
                );
              } else {
                setBatchInfoComps(
                  <span className="font-medium max-w-2xl">
                    {testDetails.batch} ({testDetails.subject})
                  </span>
                );
              }
            }, [editStudentDetails, testDetails])}
            {batchInfoComps}
          </div>
        </div>
        <div className="flex">
          <div tabindex="0" class="collapse w-full collapse-arrow">
            <input type="checkbox" id="showTestPunishment" />
            <div class="collapse-title text-xl font-medium">
              Test Punishment(s)
            </div>
            <div class="collapse-content my-5 flex flex-col space-y-10">
              <div className="flex flex-col space-y-10">
                <div className="flex flex-col px-5 lg:flex-row space-y-5 space-x-0 lg:space-y-0 lg:space-x-10 w-full">
                  <div className="flex space-x-5 items-center w-6/12 xl:w-4/12 ">
                    <div class="form-control w-6/12">
                      <input
                        type="number"
                        id="lowKey1"
                        placeholder="low"
                        class="input input-bordered w-full max-w-xs"
                      />
                    </div>
                    <p className="">to</p>
                    <div class="form-control w-6/12">
                      <input
                        type="number"
                        id="highKey1"
                        placeholder="high"
                        class="input input-bordered w-full max-w-xs"
                      />
                    </div>
                  </div>
                  <div class="form-control w-full max-w-3xl">
                    <input
                      type="text"
                      placeholder="Punishment"
                      id="pKey1"
                      class="input input-bordered w-full max-w-2xl"
                    />
                  </div>
                </div>
                <span className="divider divider-vertical"></span>
                <div className="flex flex-col px-5 lg:flex-row space-y-5 space-x-0 lg:space-y-0 lg:space-x-10 w-full">
                  <div className="flex space-x-5 items-center w-6/12 xl:w-4/12 ">
                    <div class="form-control w-6/12">
                      <input
                        type="number"
                        id="lowKey2"
                        placeholder="low"
                        class="input input-bordered w-full max-w-xs"
                      />
                    </div>
                    <p className="">to</p>
                    <div class="form-control w-6/12">
                      <input
                        type="number"
                        id="highKey2"
                        placeholder="high"
                        class="input input-bordered w-full max-w-xs"
                      />
                    </div>
                  </div>
                  <div class="form-control w-full max-w-3xl">
                    <input
                      type="text"
                      id="pKey2"
                      placeholder="Punishment"
                      class="input input-bordered w-full max-w-2xl"
                    />
                  </div>
                </div>
                <span className="divider divider-vertical"></span>
                <div className="flex flex-col px-5 lg:flex-row space-y-5 space-x-0 lg:space-y-0 lg:space-x-10 w-full">
                  <div className="flex space-x-5 items-center w-6/12 xl:w-4/12 ">
                    <div class="form-control w-6/12">
                      <input
                        type="number"
                        placeholder="low"
                        id="lowKey3"
                        class="input input-bordered w-full max-w-xs"
                      />
                    </div>
                    <p className="">to</p>
                    <div class="form-control w-6/12">
                      <input
                        type="number"
                        id="highKey3"
                        placeholder="high"
                        class="input input-bordered w-full max-w-xs"
                      />
                    </div>
                  </div>
                  <div class="form-control w-full max-w-3xl">
                    <input
                      type="text"
                      id="pKey3"
                      placeholder="Punishment"
                      class="input input-bordered w-full max-w-2xl"
                    />
                  </div>
                </div>
                <span className="divider divider-vertical"></span>
                <div className="flex flex-col px-5 lg:flex-row space-y-5 space-x-0 lg:space-y-0 lg:space-x-10 w-full">
                  <div className="flex space-x-5 items-center w-6/12 xl:w-4/12 ">
                    <div class="form-control w-6/12">
                      <input
                        id="lowKey4"
                        type="number"
                        placeholder="low"
                        class="input input-bordered w-full max-w-xs"
                      />
                    </div>
                    <p className="">to</p>
                    <div class="form-control w-6/12">
                      <input
                        type="number"
                        id="highKey4"
                        placeholder="high"
                        class="input input-bordered w-full max-w-xs"
                      />
                    </div>
                  </div>
                  <div class="form-control w-full max-w-3xl">
                    <input
                      type="text"
                      placeholder="Punishment"
                      id="pKey4"
                      class="input input-bordered w-full max-w-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col overflow-x-auto space-y-10">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="studentTableTh">Sr.</th>
                <th className="studentTableTh">Name</th>
                <th className="studentTableTh">Absent</th>
                <th className="studentTableTh">
                  Marks (Out of {formData.marksOutOf})
                </th>
              </tr>
            </thead>
            <tbody>
              {tableContentComp}
              {useEffect(() => {
                if (editStudentDetails) {
                  let studentKeys = Object.keys(
                    editStudentDetails.data.attributes.data.tdata
                  );

                  for (let j = 0; j < studentKeys.length; j++) {
                    let student =
                      editStudentDetails.data.attributes.data.tdata[
                        studentKeys[j]
                      ];
                    if (student[1] === false) {
                      document.getElementById(`isAbsent${j}`)
                        ? (document.getElementById(
                            `isAbsent${j}`
                          ).checked = true)
                        : "";
                      document.getElementById(`marks${j}`)
                        ? (document.getElementById(`marks${j}`).disabled = true)
                        : "";
                    } else {
                      document.getElementById(`marks${j}`)
                        ? (document.getElementById(`marks${j}`).value =
                            student[1])
                        : "";
                      document.getElementById(`marks${j}`)
                        ? (document.getElementById(
                            `marks${j}`
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
                  session.user.facultyData["testsData"].canEdit &&
                  window.confirm("Are you sure you want to delete this test?")
                ) {
                  axios
                    .delete(
                      process.env.NEXT_PUBLIC_STRAPI_API +
                        "/marks/" +
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
                        message: "Test deleted successfully",
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
