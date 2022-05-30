import Image from "next/image";
import { hidePass, showPass, logo } from "../public/images";
import { useState } from "react";
import { useRouter } from "next/router";
import { signIn, getCsrfToken } from "next-auth/react";
import * as Yup from "yup";
import { Formik, Field } from "formik";

export default function Login({ csrfToken }) {
  const router = useRouter();
  const [error, setError] = useState(null);

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
              setError(null);
              const res = await signIn("credentials", {
                redirect: true,
                identifier: values.username,
                password: values.password,
                callbackUrl: `${window.location.origin}/dashboard`,
              });
              if (res.error) {
                setError(res.error);
              } else {
                setError(null);
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
                <div className="text-red-400 font-semibold text-md text-center rounded p-2">
                  {error}
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
                      <input onChange={handlePasswordMask} type="checkbox" />
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
                  className="btn btn-accent my-4"
                >
                  {formik.isSubmitting ? "Please wait..." : "Log In"}
                </button>
              </form>
            )}
          </Formik>
        </div>
      </div>
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
