import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Calendar from "../utilities/Calendar";

export default function Attendance() {
  let apiData = {};

  const { data } = useSession();
  const [loadCalendar, setLoadCalendar] = useState("");

  useEffect(() => {
    axios
      .get(
        process.env.NEXT_PUBLIC_STRAPI_API +
          `/info/attendance/me?batch=${data.user.batch}&id=${data.user.id}`,
        {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        }
      )
      .then((res) => {
        loadAttendanceData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const resolveAttendanceState = (data) => {
    //  if data.method is false and data.found is true then return absent
    //  if data.method is false and data.found is false then return present
    //  if data.method is true and data.found is true then return present
    //  if data.method is true and data.found is false then return absent
    if (data.method === false && data.found === true) {
      return "absent";
    } else if (data.method === false && data.found === false) {
      return "present";
    } else if (data.method === true && data.found === true) {
      return "present";
    } else if (data.method === true && data.found === false) {
      return "absent";
    }
  };

  const loadAttendanceData = (data) => {
    for (let key in data) {
      apiData[key] = resolveAttendanceState(data[key]);
    }
    setLoadCalendar(
      <Calendar
        key={data.id}
        apiResponse={apiData}
        className="lg:max-w-xl m-5 p-5"
        minYear="0"
        maxYear="1"
      />
    );
  };

  return (
    <div className="flex flex-col mx-auto lg:mx-0 xs:w-full sm:w-11/12 md:w-8/12 lg:w-7/12">
      <div className="transform">
        <h1 className="m-5 p-5 mb-0 pb-0 font-semibold text-neutral text-2xl">
          Attendance
        </h1>
        {loadCalendar}
      </div>
    </div>
  );
}
