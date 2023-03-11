import Link from "next/link";
import { useEffect, useState } from "react";

export default function Homework() {
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
        <Link key={key} href="/student/homework/id">
          <a>
            <div className="flex flex-col bg-white hover:bg-gray-100 duration-200 rounded-lg p-5  sm:mx-5 mt-5 w-full shadow-xl">
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
    <div className="flex flex-col xs:mt-5 sm:mt-0 mx-auto w-96 lg:mx-0 lg:w-5/12 lg:h-[50vh]">
      <h1 className="sm:m-5 p-5 mb-0 pb-0 font-semibold text-neutral text-2xl">
        Homeworks
      </h1>
      {homeworkComps}
      <div className="w-full mt-8 flex justify-center">
        <Link href="/student/homework">
          <a className="btn btn-secondary">See more</a>
        </Link>
      </div>
    </div>
  );
}
