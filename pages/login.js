import Image from "next/image";
import { useState } from "react";
import { hidePass, showPass, logo } from "../public/images";
import axios from "axios";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const hardcodedDetails = {
    username: "sohel",
    password: "Shekh2212a.",
  };

  const handleFormSubmission = (e) => {
    e.preventDefault();
    axios
      .post(
        `${process.env.NEXT_PUBLIC_STRAPI_API}/auth/login`,
        {
          identifier: hardcodedDetails.username,
          password: hardcodedDetails.password,
          // identifier: formData.username,
          // password: formData.password,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        console.log(response.data);
        // setUser(response.data);
        router.push("/dashboard");
      })
      .catch((error) => {
        console.log("An error occurred:", error.response);
      });
  };

  // if #passwordMask is checked then set #password to type: password else set #password to type: text
  const [passwordType, setPasswordType] = useState("password");
  const handlePasswordMask = () => {
    if (passwordType === "password") {
      setPasswordType("text");
    } else {
      setPasswordType("password");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full fixed">
      <div className="flex w-100 bg-primary lg:px-16">
        <span className="flex flex-col mx-auto w-6/12 lg:w-3/12 p-5">
          <span className="w-1/2 lg:w-4/12 mx-auto">
            <Image src={logo} />
          </span>
          <h1 className="text-xl uppercase text-base-100 font-semibold m-auto">
            Dashboard
          </h1>
        </span>
      </div>
      <div className="flex flex-col h-screen justify-center ">
        <div className="bg-base-100 shadow-2xl p-10 xs:w-11/12 sm:w-8/12 md:w-5/12 lg:w-4/12 2xl:w-3/12 mx-auto">
          <div className="flex flex-col py-5">
            <h1 className="text-primary text-3xl font-bold uppercase">Login</h1>
            <span className="bg-accent h-1 w-5/12"></span>
          </div>
          <form
            onSubmit={handleFormSubmission}
            autoSave="true"
            className="flex flex-col w-full"
            autoComplete="true"
          >
            <div className="form-control w-100 max-w-lg py-2 m-0">
              <label htmlFor="username" className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                autoFocus
                type="text"
                name="username"
                onChange={handleChange}
                value={formData.username}
                placeholder="Enter your Username here"
                className="input input-bordered w-full max-w-lg"
              />
            </div>
            <div className="form-control  w-full max-w-lg py-1 m-0">
              <label htmlFor="password" className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="input-group">
                <input
                  id="password"
                  name="password"
                  type={passwordType}
                  onChange={handleChange}
                  value={formData.password}
                  placeholder="Enter your password here"
                  className="input input-bordered w-full max-w-lg"
                />
                <label className="btn btn-ghost bg-transparent border-1 border-slate-300 swap swap-rotate">
                  <input
                    id="passwordMask"
                    onChange={handlePasswordMask}
                    type="checkbox"
                  />
                  <div className="swap-on">
                    <Image src={hidePass} />
                  </div>
                  <div className="swap-off">
                    <Image src={showPass} />
                  </div>
                </label>
              </div>
            </div>
            <button type="submit" className="btn btn-accent my-4">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
