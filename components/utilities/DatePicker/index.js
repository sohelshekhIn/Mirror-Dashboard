import moment from "moment";
import { useState, useEffect } from "react";

export default function DatePicker({
  className,
  minYearOnCalendar,
  maxYearOnCalendar,
  setSelectedDate,
}) {
  let weekdayshort = moment.weekdaysShort();
  const [state, setState] = useState({
    showYearTable: false,
    showMonthTable: false,
    showDateTable: true,
    dateObject: moment(),
    allmonths: moment.months(),
    selectedDay: null,
    selectedDate: null,
    minYear: parseInt(minYearOnCalendar),
    maxYear: parseInt(maxYearOnCalendar),
  });

  useEffect(() => {
    const handleKeyBoardAccess = (event) => {
      if (event.keyCode === 39) {
        onPrev();
      }
      if (event.keyCode === 37) {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyBoardAccess);

    return () => {
      window.removeEventListener("keydown", handleKeyBoardAccess);
    };
  }, []);

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
    .subtract(state.minYear, "year")
    .format("Y");
  var maxPossibleYear = moment()
    .set("year", moment().format("YYYY"))
    .add(state.maxYear, "year")
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
          className="datepicker-month"
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
      <table key={Math.random()} className="datepicker-month w-full m-0 p-0">
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
    if (state.showYearTable === true) {
      setState({
        ...state,
        dateObject: state.dateObject.subtract(
          state.minYear - (state.minYear - 10),
          "year"
        ),
        minYear: state.minYear + 10,
        maxYear: state.maxYear - 10,
      });
    } else {
      setState({
        ...state,
        dateObject: state.dateObject.subtract(1, "month"),
      });
    }
  };

  const onNext = () => {
    if (state.showYearTable === true) {
      setState({
        ...state,
        dateObject: state.dateObject.add(
          state.minYear - (state.minYear - 10),
          "year"
        ),
        minYear: state.minYear - 10,
        maxYear: state.maxYear + 10,
      });
    } else {
      setState({
        ...state,
        dateObject: state.dateObject.add(1, "month"),
      });
    }
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
    let subtractYears = 5;
    let additionYears = 6;

    if (state.maxYear == 0) {
      subtractYears = state.minYear;
      additionYears = 0;
    } else if (state.minYear == 0) {
      subtractYears = 0;
      additionYears = state.maxYear;
    } else if (state.maxYear < 0 && state.minYear > 0) {
      subtractYears = state.minYear;
      additionYears = state.maxYear;
    }

    let prevfive = moment()
      .set("year", props)
      .subtract(subtractYears, "year")
      .format("Y");
    let nextfive = moment()
      .set("year", props)
      .add(additionYears, "year")
      .format("Y");
    let tenyear = getDates(prevfive, nextfive);
    let availableYears = getDates(minPossibleYear, maxPossibleYear);
    tenyear.map((data) => {
      if (availableYears.includes(data)) {
      }
      let setAvailableYear = availableYears.includes(data) ? "" : "disabled";
      months.push(
        <td
          key={data}
          className={`datepicker-month ${setAvailableYear}`}
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
      <table className="datepicker-month w-full m-0 p-0">
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
    let selectedDateObject = moment(state.dateObject).set("date", d);
    let selectedDateOnClick = selectedDateObject.format("DD/MM/YYYY");
    setState({
      ...state,
      selectedDay: d,
      selectedDate: selectedDateOnClick,
    });
    setSelectedDate(selectedDateOnClick);
  };

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
    let currentDay =
      (d == currentDayFunc()) &
      (moment(state.dateObject).month() == moment().month()) &
      (moment(state.dateObject).year() == moment().year())
        ? "today"
        : "";
    daysInMonthUi.push(
      <td
        key={d}
        className={`${currentDay}`}
        onClick={(e) => {
          onDayClick(e, d);
        }}
      >
        <span>{d}</span>
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
    <div className={"datepicker-parent " + className}>
      <div className="datepicker-nav">
        {!state.showMonthTable && (
          <span
            onClick={(e) => {
              showMonth();
            }}
            className="datepicker-nav-span"
          >
            {month()}
          </span>
        )}
        <span className="datepicker-nav-span" onClick={(e) => showYearTable()}>
          {year()}
        </span>
        <span
          onClick={(e) => {
            if (prevBtnStatus == "disabled") {
              return;
            }
            onPrev();
          }}
          className={"datepicker-nav-span" + prevBtnStatus}
        >
          <svg
            className={"mx-auto fill-secondary rotate-180 " + prevBtnStatus}
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
        <span
          onClick={(e) => {
            if (nextBtnStatus == "disabled") {
              return;
            }
            onNext();
          }}
          className={"datepicker-nav-span " + nextBtnStatus}
        >
          <svg
            className={"mx-auto fill-secondary " + nextBtnStatus}
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
          <table className="datepicker-day w-full m-0 p-0">
            <thead>
              <tr>{weekdayshortname}</tr>
            </thead>
            <tbody>{daysInMonthFunc}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
