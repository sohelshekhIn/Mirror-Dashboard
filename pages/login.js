import Image from "next/image";
import { useState } from "react";
import { hidePass, showPass } from "../public/images";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    console.log({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmission = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="flex flec-col">
      <form className="bg-base-100 shadow-xl p-10 w-4/12 mx-auto mt-[15%]">
        <div className="flex flex-col py-5">
          <h1 className="text-primary text-3xl font-bold uppercase">Login</h1>
          <span className="bg-accent h-1 w-5/12"></span>
        </div>
        <div class="form-control w-full max-w-xs py-2">
          <label htmlFor="username" class="label">
            <span class="label-text">Username</span>
          </label>
          <input
            type="text"
            name="username"
            onChange={handleChange}
            value={formData.username}
            placeholder="Enter your Username here"
            class="input input-bordered w-full max-w-xs"
          />
        </div>
        {/* <div class="form-control w-full max-w-xs py-2">
          <label htmlFor="password" class="label">
            <span class="label-text">Password</span>
          </label>
          <input
            type="password"
            name="password"
            onChange={handleChange}
            value={formData.password}
            placeholder="Enter your Password here"
            class="input input-bordered w-full max-w-xs"
          />
        </div> */}

        <div class="form-control  w-full max-w-xs py-2">
          <div class="input-group">
            <input
              type="password"
              placeholder="Enter your password here"
              class="input input-bordered"
            />
            <label class="btn swap swap-rotate">
              <input type="checkbox" />
              <div className="swap-on">
                <Image src={showPass} />
              </div>
              <div className="swap-off">
                <Image src={hidePass} />
              </div>
              {/* <svg
                class="swap-on fill-current w-10 h-10"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
              </svg>
              <svg
                class="swap-off fill-current w-10 h-10"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
              </svg> */}
            </label>
          </div>
        </div>
        <button className="btn btn-accent my-4">Login</button>
      </form>
    </div>
  );
}

//  <div className="form-control py-2 pt-0 w-100 max-w-xs mx-auto">
//    <label htmlFor="username" className="label">
//      <span className="label-text">Username</span>
//    </label>
//    <input
//      name="username"
//      onChange={handleChange}
//      value={formData.username}
//      type="text"
//      placeholder="Username"
//      className="input input-bordered w-100 max-w-xs font-semibold"
//    />
//  </div>;
