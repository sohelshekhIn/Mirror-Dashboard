import Link from "next/link";
import Image from "next/image";
import { logoBlue } from "../../public/images";
import { signIn, signOut } from "next-auth/react";
import { maleAvatar, femaleAvatar } from "../../public/images";
import { useEffect, useState } from "react";

export default function FacultyNavbar({ children, session }) {
  // when #main is clicked, check the checkbox
  const [avatar, setAvatar] = useState(maleAvatar);
  useEffect(() => {
    let content = document.getElementById("content");
    let menu = document.getElementById("menu-open");
    let navLinks = document.getElementById("navLinks");
    content.addEventListener("click", () => {
      menu.checked = false;
    });
    navLinks.addEventListener("click", () => {
      menu.checked = false;
    });

    if (session.user.gender == "Female") {
      setAvatar(femaleAvatar);
    }
  }, []);

  const moduleLinks = [
    //  3 tabs  / "2 spaces"
    {
      moduleId: 11,
      moduleName: "Take Attendance",
      moduleLink: "/faculty/attendance",
    },
    {
      moduleId: 12,
      moduleName: "Verify Attendance",
      moduleLink: "/faculty/attendance/verify-attendance",
    },
    // sub module
    //    moduleId: 13,
    //    moduleLink: "/faculty/attendance/verify-attendance/verify",
    {
      moduleId: 14,
      moduleName: "Register Student",
      moduleLink: "/faculty/register-student",
    },
    {
      moduleId: 154,
      moduleName: "View Students",
      moduleLink: "/faculty/view-students",
    },
    // sub modules
    //      moduleId: 57,
    //      moduleLink: "/faculty/view-student/edit-details"
    {
      moduleId: 15,
      moduleName: "Manage Batches",
      moduleLink: "/faculty/manage-batches",
    },
    {
      moduleId: 16,
      moduleName: "Manage Submissions",
      moduleLink: "/faculty/manage-submissions",
    },
    // sub module
    //      moduleId: 20,
    //      moduleLink: "/faculty/manage-submissions/new-submission"

    //      moduleId: 21,
    //      moduleLink: "/faculty/manage-submissions/edit-details/[id]"
    {
      moduleId: 17,
      moduleName: "Manage Tests",
      moduleLink: "/faculty/manage-tests",
    },
    // sub module:
    //      moduleId: 18,
    //      moduleLink: "/faculty/manage-tests/new-test"

    //      moduleId: 19,
    //      moduleLink: "/faculty/manage-tests/edit-details/[id]" (on Submit)
    {
      moduleId: 22,
      moduleName: "Register Faculty",
      moduleLink: "/faculty/register-faculty",
    },
    {
      moduleId: 23,
      moduleName: "View Faculty",
      moduleLink: "/faculty/view-faculty",
    },
    {
      moduleId: 22,
      moduleName: "Shortcuts",
      moduleLink: "/faculty/shortcuts",
    },
  ];

  return (
    <div className="flex flex-col ">
      <div className="navbar bg-white lg:justify-between z-50 pt-5 shadow-md fixed top-0 duration-500">
        <div className="navbar-start lg:hidden">
          <div className="dropdown">
            <label
              tabIndex="1"
              htmlFor="menu-open"
              className="btn btn-ghost btn-circle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </label>
          </div>
        </div>
        <div className="navbar-center">
          <Link href="/">
            <a className="btn btn-link w-28 p-1 my-2 lg:w-32 lg:mx-2">
              <Image
                src={logoBlue}
                priority="true"
                alt="Mirror Institute Nadiad - Best Tution Classes in Nadiad, Mirror Institute Logo"
              />
            </a>
          </Link>
        </div>
        <div className="navbar-end">
          <div className="mx-5 hidden md:block">{session.user.name}</div>
          <div className="dropdown dropdown-end">
            <label tabIndex="0" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <Image src={avatar} />
              </div>
            </label>
            <ul
              tabIndex="0"
              className="menu menu-normal dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a className="justify-between">{session.user.name}</a>
              </li>
              <li>
                <a className="justify-between">Profile</a>
              </li>
              <li>
                <a>Settings</a>
              </li>
              <li>
                <a onClick={() => signOut().then(() => signIn())}>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="relative overflow-hidden min-h-screen md:flex ">
        <input type="checkbox" id="menu-open" className="hidden" />
        <aside
          id="sidebar"
          className="fixed bg-white h-full md:h-screen z-40 text-secondary shadow-md md:w-64 w-3/4 space-y-6 pt-6 px-0 top-0 left-0 transform md:relative md:translate-x-0 transition duration-200 ease-in-out md:flex md:flex-col"
        >
          <ul
            tabIndex="0"
            id="navLinks"
            className="mt-24 menu menu-normal h-full"
          >
            <li className="navli duration-200">
              <Link href="/">
                <a className="text-secondary font-medium">Dashboard</a>
              </Link>
            </li>
            {/* loop throgh moduleLinks */}
            {Object.keys(moduleLinks).map((key) => {
              // check if module id is in session.user.facultyData["facultyRoles"]
              if (
                session.user.facultyData["facultyRoles"].includes(
                  moduleLinks[key].moduleId
                )
              ) {
                return (
                  <li className="navli duration-200" key={key}>
                    <Link href={moduleLinks[key].moduleLink}>
                      <a className="text-secondary font-medium">
                        {moduleLinks[key].moduleName}
                      </a>
                    </Link>
                  </li>
                );
              }
            })}

            {/* <li className="navli duration-200">
              <Link href="/faculty/attendance">
                <a className="text-secondary">Take Attendance</a>
              </Link>
            </li>
            <li className="navli duration-200">
              <Link href="/faculty/register-student">
                <a className="text-secondary">Register Student</a>
              </Link>
            </li>
            <li className="navli duration-200">
              <Link href="/faculty/view-student">
                <a className="text-secondary">View Student</a>
              </Link>
            </li> */}
          </ul>
          <p className="p-5 text-gray-400 font-semibold text-xs">
            Designed and Developed by <br />
            Sohel Shekh
          </p>
        </aside>

        <main
          id="content"
          className="w-screen h-screen flex-1 overflow-y-scroll"
        >
          <div className="max-w-7xl h-100 mt-24 mb-24">{children} </div>
        </main>
      </div>
    </div>
  );
}

export function DashboardContent({ children }) {
  return (
    <div className="m-5 my-32 md:m-16 md:my-32 lg:m-24 lg:ml-44 lg:my-40 h-100">
      {children}
    </div>
  );
}
