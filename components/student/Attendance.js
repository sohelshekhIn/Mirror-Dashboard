import Calendar from "../utilities/Calendar";

export default function Attendance() {
  let apiData = {
    1: {
      date: "2-5-2022",
      value: "present",
    },
    2: {
      date: "3-5-2022",
      value: "absent",
    },
    3: {
      date: "4-5-2022",
      value: "present",
    },
    4: {
      date: "5-6-2022",
      value: "present",
    },
    5: {
      date: "6-6-2022",
      value: "present",
    },
    6: {
      date: "7-6-2022",
      value: "absent",
    },
    7: {
      date: "8-6-2022",
      value: "present",
    },
    8: {
      date: "9-6-2022",
      value: "holiday",
    },
  };
  return (
    <div className="flex flex-col mx-auto lg:mx-0 xs:w-full sm:w-11/12 md:w-8/12 lg:w-7/12">
      <div className="transform">
        <h1 className="m-5 p-5 mb-0 pb-0 font-semibold text-secondary text-2xl">
          Attendance
        </h1>
        <Calendar
          apiResponse={apiData}
          className="lg:max-w-xl m-5 p-5"
          minYear="0"
          maxYear="1"
        />
      </div>
    </div>
  );
}
