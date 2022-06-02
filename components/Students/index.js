import Navbar from "./Navbar";
import Calendar from "../utilities/Calendar";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function StudentDashboard() {
  return (
    <div className="h-screen">
      <div className="navHead">
        <Navbar />
      </div>
      <div className="mt-40 w-full lg:px-16 xl:px-48 flex flex-col debug">
        <div className="flex flex-col lg:flex-row">
          <Attendance />
          <Homework />
        </div>
        <div className="flex flex-wrap">
          <TestResults />
        </div>
      </div>
    </div>
  );
}

const Attendance = () => {
  return (
    <div className="flex flex-col mx-auto lg:mx-0 w-96 lg:w-7/12">
      <div className="transform sm:-translate-x-[15%] lg:translate-x-0">
        <h1 className="m-5 p-5 mb-0 pb-0 font-semibold text-secondary text-2xl">
          Attendance
        </h1>
        <Calendar className="max-w-xl" minYear="0" maxYear="1" />
      </div>
    </div>
  );
};

const Homework = () => {
  const [homeworkComps, setHomeworkComps] = useState([]);
  let api = {
    1: {
      title: "Homework 1",
      description: "This is the first homework",
      dueDate: "2020-01-01",
      subject: "Chemistry",
      givenDate: "2020-01-01",
    },
    2: {
      title: "Homework 2",
      description: "This is the second homework",
      dueDate: "2020-01-01",
      subject: "Chemistry",
      givenDate: "2020-01-01",
    },
    3: {
      title: "Homework 2",
      description: "This is the second homework",
      dueDate: "2020-01-01",
      subject: "Chemistry",
      givenDate: "2020-01-01",
    },
    4: {
      title: "Homework 2",
      description: "This is the second homework",
      dueDate: "2020-01-01",
      subject: "Chemistry",
      givenDate: "2020-01-01",
    },
    5: {
      title: "Homework 2",
      description: "This is the second homework",
      dueDate: "2020-01-01",
      subject: "Chemistry",
      givenDate: "2020-01-01",
    },
  };
  useEffect(() => {
    let homeworkComp = [];
    // create element for every element of api
    for (let key in api) {
      homeworkComp.push(
        <Link href="/student/homework/id">
          <a>
            <div className="flex flex-col bg-white hover:bg-gray-100 duration-200 rounded-lg p-5 mx-5 mt-5 w-full shadow-xl">
              <div className="flex justify-between">
                <span>{api[key].subject}</span>
                <span>{api[key].givenDate}</span>
                <span>{api[key].dueDate}</span>
              </div>
              <div className="mt-3">
                <span className="font-medium">{api[key].title}</span>
              </div>
            </div>
          </a>
        </Link>
      );
    }
    setHomeworkComps(homeworkComp);
  }, []);

  return (
    <div className="flex flex-col mx-auto w-96 lg:mx-0 lg:w-5/12 lg:h-[50vh]">
      <h1 className="m-5 p-5 mb-0 pb-0 font-semibold text-secondary text-2xl">
        Homeworks
      </h1>
      {homeworkComps}
      <div className="w-full mt-8 flex justify-center">
        <Link href="/student/homework">
          <a className="btn btn-accent">See more</a>
        </Link>
      </div>
    </div>
  );
};

const TestResults = () => {
  const [resultComps, setResultComps] = useState([]);
  let api = {
    1: {
      date: "1/2/22",
      subject: "Chemistry",
      marks: "80/100",
    },
    2: {
      date: "1/2/22",
      subject: "Chemistry",
      marks: "80/100",
    },
    3: {
      date: "1/2/22",
      subject: "Chemistry",
      marks: "80/100",
    },
  };
  // remove useEffect when fetching from api
  useEffect(() => {
    let resultComp = [];
    for (let key in api) {
      resultComp.push(
        <Link href="/student/test-results/id">
          <a className="">
            <div className="w-full flex p-4 justify-between bg-white hover:bg-gray-100 duration-200">
              <span className="w-4/12 text-center">{api[key].date}</span>
              <span className="w-4/12 text-center">{api[key].subject}</span>
              <span className="w-4/12 text-center">{api[key].marks}</span>
            </div>
          </a>
        </Link>
      );
    }
    setResultComps(resultComps.concat(resultComp));
  }, []);
  return (
    <div className="flex flex-col mx-auto w-96 lg:w-6/12 lg:mx-0">
      <h1 className="m-5 p-5 mb-0 pb-0 font-semibold text-secondary text-2xl">
        Test Results
      </h1>
      <div className="bg-white rounded-lg p-5 m-5 w-full shadow-xl">
        <div className="w-100 flex p-4 pb-0 text-lg">
          <span className="w-4/12 text-center">Date</span>
          <span className="w-4/12 text-center">Subject</span>
          <span className="w-4/12 text-center">Marks</span>
        </div>
        <span className="divider divider-vertical my-1"></span>
        {resultComps}
        <div className="w-full mt-8 flex justify-center">
          <Link href="/student/homework">
            <a className="btn btn-accent">See more</a>
          </Link>
        </div>
      </div>
    </div>
  );
};
