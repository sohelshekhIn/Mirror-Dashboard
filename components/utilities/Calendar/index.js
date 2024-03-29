import moment from "moment";
import { useState } from "react";
import Link from "next/link";

export default function Calendar({ className, apiResponse, minYear, maxYear }) {
  let weekdayshort = moment.weekdaysShort();
  const [state, setState] = useState({
    showYearTable: false,
    showMonthTable: false,
    showDateTable: true,
    dateObject: moment(),
    allmonths: moment.months(),
    selectedDay: null,
  });

  const daysInMonth = () => {
    return state.dateObject.daysInMonth();
  };
  const year = () => {
    return state.dateObject.format("Y");
  };
  const currentDayFunc = () => {
    return state.dateObject.format("D");
  };
  const firstDayOfMonth = () => {
    let dateObject = state.dateObject;
    let firstDay = moment(dateObject).startOf("month").format("d"); // Day of week 0...1..5...6
    return firstDay;
  };
  const month = () => {
    return state.dateObject.format("MMMM");
  };

  var minPossibleYear = moment()
    .set("year", moment().format("YYYY"))
    .subtract(minYear, "year")
    .format("Y");
  var maxPossibleYear = moment()
    .set("year", moment().format("YYYY"))
    .add(maxYear, "year")
    .format("Y");

  const showMonth = (e, month) => {
    // if showYearTable is true, then close the year table
    if (state.showYearTable) {
      setState({
        ...state,
        showYearTable: false,
        showMonthTable: true,
        showDateTable: false,
      });
    } else {
      setState({
        ...state,
        showMonthTable: !state.showMonthTable,
        showDateTable: !state.showDateTable,
      });
    }
  };
  const setMonth = (month) => {
    let monthNo = state.allmonths.indexOf(month);
    let dateObject = Object.assign({}, state.dateObject);
    dateObject = moment(dateObject).set("month", monthNo);
    setState({
      ...state,
      dateObject: dateObject,
      showMonthTable: !state.showMonthTable,
      showDateTable: !state.showDateTable,
    });
  };

  const MonthList = (props) => {
    let months = [];
    props.data.map((data) => {
      months.push(
        <td
          key={data}
          className="calendar-month"
          onClick={(e) => {
            setMonth(data);
          }}
        >
          <span>{data}</span>
        </td>
      );
    });
    let rows = [];
    let cells = [];

    months.forEach((row, i) => {
      if (i % 3 !== 0 || i == 0) {
        cells.push(row);
      } else {
        rows.push(cells);
        cells = [];
        cells.push(row);
      }
    });
    rows.push(cells);
    let monthlist = rows.map((d, i) => {
      return <tr key={d + i}>{d}</tr>;
    });
    return (
      <table key={Math.random()} className="calendar-month w-full m-0 p-0">
        <thead>
          <tr>
            <th colSpan="4">Select a Month</th>
          </tr>
        </thead>
        <tbody>{monthlist}</tbody>
      </table>
    );
  };

  const showYearTable = (e) => {
    if (state.showMonthTable) {
      setState({
        ...state,
        showMonthTable: false,
        showYearTable: true,
        showDateTable: false,
      });
    } else {
      setState({
        ...state,
        showYearTable: !state.showYearTable,
        showDateTable: !state.showDateTable,
      });
    }
  };

  const onPrev = () => {
    let curr = "";
    if (state.showYearTable === true) {
      curr = "year";
    } else {
      curr = "month";
    }
    setState({
      ...state,
      dateObject: state.dateObject.subtract(1, curr),
    });
  };
  const onNext = () => {
    let curr = "";
    if (state.showYearTable === true) {
      curr = "year";
    } else {
      curr = "month";
    }
    setState({
      ...state,
      dateObject: state.dateObject.add(1, curr),
    });
  };
  const setYear = (year) => {
    let dateObject = Object.assign({}, state.dateObject);
    dateObject = moment(dateObject).set("year", year);
    setState({
      ...state,
      dateObject: dateObject,
      showMonthTable: !state.showMonthTable,
      showYearTable: !state.showYearTable,
    });
  };
  const onYearChange = (e) => {
    setYear(e.target.value);
  };

  const getDates = (startDate, stopDate) => {
    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate = moment(stopDate);
    while (currentDate <= stopDate) {
      dateArray.push(moment(currentDate).format("YYYY"));
      currentDate = moment(currentDate).add(1, "year");
    }
    return dateArray;
  };
  const YearTable = (props) => {
    let months = [];
    let prevfive = moment().set("year", props).subtract(5, "year").format("Y");
    let nextfive = moment().set("year", props).add(6, "year").format("Y");
    let tenyear = getDates(prevfive, nextfive);
    let availableYears = getDates(minPossibleYear, maxPossibleYear);
    tenyear.map((data) => {
      if (availableYears.includes(data)) {
      }
      let setAvailableYear = availableYears.includes(data) ? "" : "disabled";
      months.push(
        <td
          key={data}
          className={`calendar-month ${setAvailableYear}`}
          onClick={(e) => {
            if (setAvailableYear === "") {
              setYear(data);
            }
          }}
        >
          <span>{data}</span>
        </td>
      );
    });
    let rows = [];
    let cells = [];

    months.forEach((row, i) => {
      if (i % 3 !== 0 || i == 0) {
        cells.push(row);
      } else {
        rows.push(cells);
        cells = [];
        cells.push(row);
      }
    });
    rows.push(cells);
    let yearlist = rows.map((d, i) => {
      return <tr key={d + i}>{d}</tr>;
    });

    return (
      <table className="calendar-month w-full m-0 p-0">
        <thead>
          <tr>
            <th colSpan="4">Select Year</th>
          </tr>
        </thead>
        <tbody>{yearlist}</tbody>
      </table>
    );
  };
  const onDayClick = (e, d) => {
    // setState({
    // ...state, selectedDay: d }, () => {
    //   console.log("SELECTED DAY: ", state.selectedDay);
    // });
  };

  let monthObject = [];
  for (let key in apiResponse) {
    // format of date is "DD/MM/YYYY"
    let dateArray = key.split("/");
    // let calendarMonth = moment(state.dateObject).month() + 1
    let calendarMonth =
      moment(state.dateObject).month().toString().length === 1
        ? "0" + dateArray[1]
        : parseInt(dateArray[1]);
    if (
      calendarMonth == moment(state.dateObject).month() + 1 &&
      dateArray[2] == moment(state.dateObject).year()
    ) {
      monthObject.push({
        date: key,
        value: apiResponse[key],
      });
    }
  }

  // get
  let weekdayshortname = weekdayshort.map((day) => {
    return <th key={day}>{day[0]}</th>;
  });
  let blanks = [];
  for (let i = 0; i < firstDayOfMonth(); i++) {
    blanks.push(<td className="` empty">{""}</td>);
  }
  let daysInMonthUi = [];
  for (let d = 1; d <= daysInMonth(); d++) {
    let attendence = "";
    let dateWithZero = d.toString().length === 1 ? "0" + d : d;
    for (let i = 0; i < monthObject.length; i++) {
      if (
        monthObject[i].date.split("/")[0] == dateWithZero &&
        monthObject[i].date.split("/")[1] ==
          moment(state.dateObject).month() + 1 &&
        monthObject[i].date.split("/")[2] == moment(state.dateObject).year()
      ) {
        attendence = monthObject[i].value;
      }
    }
    let currentDay =
      (d == currentDayFunc()) &
      (moment(state.dateObject).month() == moment().month()) &
      (moment(state.dateObject).year() == moment().year())
        ? "today"
        : "";
    daysInMonthUi.push(
      <td key={d} className={`${attendence} ${currentDay} `}>
        <span
          onClick={(e) => {
            onDayClick(e, d);
          }}
        >
          {d}
        </span>
      </td>
    );
  }

  var totalSlots = [...blanks, ...daysInMonthUi];
  let rows = [];
  let cells = [];

  totalSlots.forEach((row, i) => {
    if (i % 7 !== 0) {
      cells.push(row);
    } else {
      rows.push(cells);
      cells = [];
      cells.push(row);
    }
    if (i === totalSlots.length - 1) {
      rows.push(cells);
    }
  });

  var daysInMonthFunc = rows.map((d, i) => {
    return <tr key={d + i}>{d}</tr>;
  });

  var nextBtnStatus =
    (year() >= maxPossibleYear) &
    (month().toLowerCase() == "December".toLowerCase())
      ? "disabled"
      : "";
  var prevBtnStatus =
    (year() <= minPossibleYear) &
    (month().toLowerCase() == "January".toLowerCase())
      ? "disabled"
      : "";

  return (
    <div className={"calendar-parent " + className}>
      <div className="calendar-nav">
        <span
          onClick={(e) => {
            if (prevBtnStatus == "disabled") {
              return;
            }
            onPrev();
          }}
          className={"calendar-nav-span" + prevBtnStatus}
        >
          <svg
            className={"mx-auto fill-neutral rotate-180 " + prevBtnStatus}
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            width="12.000000pt"
            height="12.000000pt"
            viewBox="0 0 16.000000 16.000000"
            preserveAspectRatio="xMidYMid meet"
          >
            <g
              transform="translate(0.000000,16.000000) scale(0.100000,-0.100000)"
              stroke="none"
            >
              <path
                d="M40 155 c0 -5 14 -24 32 -42 l32 -33 -34 -35 c-18 -19 -31 -37 -29
-40 3 -2 23 13 44 35 l39 40 -42 43 c-23 23 -42 37 -42 32z"
              />
            </g>
          </svg>
        </span>
        {!state.showMonthTable && (
          <span
            onClick={(e) => {
              showMonth();
            }}
            className="calendar-nav-span"
          >
            {month()}
          </span>
        )}
        <span className="calendar-nav-span" onClick={(e) => showYearTable()}>
          {year()}
        </span>

        <span
          onClick={(e) => {
            if (nextBtnStatus == "disabled") {
              return;
            }
            onNext();
          }}
          className={"calendar-nav-span " + nextBtnStatus}
        >
          <svg
            className={"mx-auto fill-neutral " + nextBtnStatus}
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            width="12.000000pt"
            height="12.000000pt"
            viewBox="0 0 16.000000 16.000000"
            preserveAspectRatio="xMidYMid meet"
          >
            <g
              transform="translate(0.000000,16.000000) scale(0.100000,-0.100000)"
              stroke="none"
            >
              <path
                d="M40 155 c0 -5 14 -24 32 -42 l32 -33 -34 -35 c-18 -19 -31 -37 -29
-40 3 -2 23 13 44 35 l39 40 -42 43 c-23 23 -42 37 -42 32z"
              />
            </g>
          </svg>
        </span>
      </div>

      <div className="m-0 p-0">
        {state.showYearTable && <YearTable props={year()} />}
        {state.showMonthTable && <MonthList data={moment.months()} />}
      </div>

      {state.showDateTable && (
        <div className="m-0 p-0">
          <table className="calendar-day w-full m-0 p-0">
            <thead>
              <tr>{weekdayshortname}</tr>
            </thead>
            <tbody>{daysInMonthFunc}</tbody>
          </table>
        </div>
      )}
      <div className="flex xs:flex-col-reverse lg:flex-row justify-end mt-8">
        <div className="xs:w-full xs:mx-auto xs:mt-5 lg:mt-0">
          <div className="flex lg:w-full mx-5 xs:justify-center justify-start">
            <Link href="/student/attendance">
              <a className="btn btn-secondary">See More</a>
            </Link>
          </div>
        </div>
        <div className="xs:w-full flex xs:mx-auto">
          <div className="flex flex-col mx-5">
            <span className="bg-transparent mx-auto bg-opacity-30 w-6 h-6 border-info border-2 rounded-full"></span>
            <span className="text-md">Today</span>
          </div>
          <div className="flex flex-col mx-5">
            <span className="bg-success mx-auto bg-opacity-30 w-6 h-6 border-success border-2 rounded-full"></span>
            <span className="text-md">Present</span>
          </div>
          <div className="flex flex-col mx-5">
            <span className="bg-error mx-auto bg-opacity-30 w-6 h-6 border-error border-2 rounded-full"></span>
            <span className="text-md">Absent</span>
          </div>
          <div className="flex flex-col mx-5">
            <span className="bg-primary mx-auto bg-opacity-30 w-6 h-6 border-primary border-2 rounded-full"></span>
            <span className="text-md">Holiday</span>
          </div>
        </div>
      </div>
    </div>
  );
}
