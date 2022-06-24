import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { calendarPNG } from "../../public/images";
import DatePicker from "../utilities/DatePicker";

export default function StudentMarksTableView({
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

  const handleChange = (e) => {
    setValidatonError(null);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    console.log({
      ...formData,
      [e.target.name]: e.target.value,
    });
    console.log(formData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(submittedData);
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
      let processedData = { tdata: { ...data }, testTitle: formData.testTitle };

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
          }, 3000);
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
  };

  // Data eg to send to server:
  //  BATCH_SUBJECT_TESTDATE_TOTALMARKS_RANDOMUID
  // "12NCERT_MATHS_23/06/2022_30_6241": {
  //   ST25551: ["Student Name", marks/false]
  // },

  useEffect(() => {
    tableData();
  }, [students]);

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
            <div class="form-control w-full max-w-xl">
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
            <span className="font-medium max-w-2xl">{testDetails.subject}</span>
          </div>
        </div>
        <div className="flex flex-col overflow-x-auto space-y-10">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="studentTableTh">Sr.</th>
                <th className="studentTableTh">Name</th>
                <th className="studentTableTh">Absent</th>
                <th className="studentTableTh">Marks (Out of 100)</th>
              </tr>
            </thead>
            <tbody>{tableContentComp}</tbody>
          </table>
          <div className="w-full flex justify-end">
            <button type="submit" className="btn btn-accent">
              Submit
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
