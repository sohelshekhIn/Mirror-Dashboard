import Link from "next/link";
import { useEffect, useState } from "react";

export default function TestResults() {
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
        <Link key={key} href="/student/test-results/id">
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
      <h1 className="sm:m-5  xs:mt-10 p-5 mb-0 pb-0 font-semibold text-neutral text-2xl">
        Test Results
      </h1>
      <div className="bg-white rounded-lg p-5 mt-5 sm:m-5 w-full shadow-xl">
        <div className="w-100 flex p-4 pb-0 text-lg">
          <span className="w-4/12 text-center">Date</span>
          <span className="w-4/12 text-center">Subject</span>
          <span className="w-4/12 text-center">Marks</span>
        </div>
        <span className="divider divider-vertical my-1"></span>
        {resultComps}
        <div className="w-full mt-8 flex justify-center">
          <Link href="/student/homework">
            <a className="btn btn-secondary">See more</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
