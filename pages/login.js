import Image from "next/image";
import { hidePass, showPass, logoBlue } from "../public/images";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signIn, getCsrfToken, getSession, useSession } from "next-auth/react";
import * as Yup from "yup";
import { Formik, Field } from "formik";
import Link from "next/link";
import DashboardHandler from "../components/utilities/DashbordHandler";

export default function Login({ csrfToken }) {
  const router = useRouter();
  const [loginError, setLoginError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  useState(() => {
    if (typeof window === "undefined") return null;
  });

  // How to check if user is logged in?
  const [session, setSession] = useState(null);
  useEffect(() => {
    getSession().then((session) => {
      setSession(session);
    });
  }, []);
  if (session) {
    // Check if user can go back then go back or else redirect to dashboard
    DashboardHandler({ session });
  }

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
      <div className="px-5 pt-3 lg:px-8 lg:pt-8">
        <div className="navbar bg-gray-100 shadow-xl p-5 rounded-lg">
          <div className="mx-auto">
            <Link tabIndex="0" href="/">
              <a
                tabIndex="0"
                className="btn btn-ghost normal-case text-xl pb-5"
              >
                <span className="w-10/12">
                  <Image src={logoBlue} />
                </span>
              </a>
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col h-screen justify-center ">
        <div className="bg-base-100 shadow-2xl p-10 xs:w-11/12 sm:w-8/12 md:w-5/12 lg:w-4/12 2xl:w-3/12 mx-auto">
          <div className="flex flex-col py-5">
            <h1 className="text-primary text-3xl font-bold uppercase">Login</h1>
            <span className="bg-accent h-1 w-5/12"></span>
          </div>
          <Formik
            initialValues={{
              username: "",
              password: "",
            }}
            validationSchema={Yup.object({
              username: Yup.string()
                .required("Username is required")
                .min(3, "Username must be at least 3 characters"),
              password: Yup.string()
                .required("Password is required")
                .min(3, "Password must be at least 3 characters"),
            })}
            onSubmit={async (values, { setSubmitting }) => {
              setLoginError(null);
              const res = await signIn("credentials", {
                redirect: false,
                identifier: values.username,
                password: values.password,
                callbackUrl: `${window.location.origin}/dashboard`,
              });
              console.log(res?.error);
              if (res.error) {
                setLoginError(res.error);
              } else {
                setLoginError(null);
                if (res.url) router.push(res.url);
              }
              setSubmitting(false);
            }}
          >
            {(formik) => (
              <form
                onSubmit={formik.handleSubmit}
                autoSave="true"
                className="flex flex-col w-full"
                autoComplete="true"
              >
                {/* Handle Validation Errors */}
                {setValidationError(null)}
                {formik.errors.username &&
                  formik.touched.username &&
                  setValidationError(formik.errors.username)}
                {formik.errors.password &&
                  formik.touched.password &&
                  setValidationError(formik.errors.password)}
                <div className="text-red-400 font-semibold text-md text-center rounded p-2">
                  {validationError}
                </div>
                <input
                  name="csrfToken"
                  type="hidden"
                  defaultValue={csrfToken}
                />
                <div className="form-control w-100 max-w-lg py-2 m-0">
                  <label htmlFor="username" className="label">
                    <span className="label-text">Username</span>
                  </label>
                  <Field
                    type="text"
                    name="username"
                    aria-label="Enter your Username here"
                    aria-required="true"
                    placeholder="Enter your Username here"
                    className="input input-bordered w-full max-w-lg"
                  />
                </div>
                <div className="form-control  w-full max-w-lg py-1 m-0">
                  <label htmlFor="password" className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <div className="input-group">
                    <Field
                      id="password"
                      name="password"
                      type={passwordType}
                      aria-label="Enter your Password here"
                      aria-required="true"
                      placeholder="Enter your password here"
                      className="input input-bordered w-full max-w-lg"
                    />
                    <label className="btn btn-ghost bg-transparent border-1 border-slate-300 swap swap-rotate">
                      <input
                        onChange={handlePasswordMask}
                        type="checkbox"
                        accessKey="V"
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
                <button
                  accessKey="S"
                  type="submit"
                  className={
                    "btn btn-accent my-4 mt-8 " +
                    (validationError !== null
                      ? "opacity-50 disabled cursor-not-allowed"
                      : "")
                  }
                >
                  {formik.isSubmitting ? "Please wait..." : "Log In"}
                </button>
              </form>
            )}
          </Formik>
        </div>
      </div>
      <ErrorNotification error={loginError} />
    </div>
  );
}

export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}

const ErrorNotification = ({ error }) => {
  var yCords = 96;
  const [animateClass, setAnimateClass] = useState(`translate-y-${yCords}`);
  useEffect(() => {
    if (error) {
      setAnimateClass("translate-y-0");
      setTimeout(() => {
        setAnimateClass(`translate-y-${yCords}`);
      }, 6000);
    }
  }, [error]);

  return (
    <div
      className={`absolute w-96 transform transition-all ease-in-out duration-1000 right-[50%] translate-x-[50%] lg:translate-x-0 lg:right-14 bottom-24 alert alert-error shadow-lg ${animateClass}`}
    >
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current flex-shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{error}</span>
      </div>
    </div>
  );
};
