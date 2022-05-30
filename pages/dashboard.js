import { useSession, signOut, getSession, signIn } from "next-auth/react";
import { useState } from "react";
import PageNotFound from "./404";

export default function Dashboard() {
  const { data: session } = useSession();
  useState(() => {
    if (typeof window === "undefined") return null;
  });
  if (session) {
    return (
      <div className="flex flex-col h-screen w-full fixed">
        <div className="flex w-100 bg-primary lg:px-16">
          <span className="flex flex-col mx-auto w-6/12 lg:w-3/12 p-5">
            <span className="w-1/2 lg:w-4/12 mx-auto"></span>

            <h1 className="text-xl uppercase text-base-100 font-semibold m-auto">
              Dashboard
            </h1>
          </span>
        </div>
        <div className="flex flex-col mx-auto">
          <h1 className="text-xl text-secondary font-semibold m-auto">
            {session.user.username}
          </h1>
          <h1 className="text-xl  text-secondary font-semibold m-auto">
            {session.user.email}
          </h1>
          <h1 className="text-xl  text-secondary font-semibold m-auto">
            {session.user.id}
          </h1>
          <h1 className="text-xl  text-secondary font-semibold m-auto">
            {session.user.role}
          </h1>
          <button
            className="bg-primary text-white font-bold py-2 px-4 rounded"
            onClick={() => signOut().then(() => signIn())}
          >
            Signout
          </button>
        </div>
      </div>
    );
  }
  return <PageNotFound />;
}

export async function getServerSideProps(context) {
  return {
    props: {
      session: await getSession(context),
    },
  };
}
