import Link from "next/link";
import Image from "next/image";
import { logoBlue } from "../../public/images";
import { signIn, signOut } from "next-auth/react";
import { maleAvatar, femaleAvatar } from "../../public/images";

export default function StudentNavbar({ session }) {
  return (
    <div className="navbar bg-white z-50 pt-5 shadow-md fixed top-0 duration-500 lg:px-16 xl:px-48 3xl:px-96">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex="0" className="btn btn-ghost btn-circle">
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
          <ul
            tabIndex="0"
            className="menu menu-normal dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link href="/">
                <a>Website</a>
              </Link>
            </li>
            <li>
              <Link href="/student/attendance">
                <a>Attendence</a>
              </Link>
            </li>
            <li>
              <Link href="/student/homeworks">
                <a>Homeworks</a>
              </Link>
            </li>
            <li>
              <Link href="/student/test-results">
                <a>Test Results</a>
              </Link>
            </li>
          </ul>
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
        <div className="mx-5">{session.user.name}</div>
        <div className="dropdown dropdown-end">
          <label tabIndex="0" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <Image src={maleAvatar} />
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
  );
}
