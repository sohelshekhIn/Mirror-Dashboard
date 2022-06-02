import { useSession, signOut, getSession, signIn } from "next-auth/react";
import { useState } from "react";
import PageNotFound from "./404";

export default function Test() {
  const { data: session } = useSession();
  useState(() => {
    if (typeof window === "undefined") return null;
  });
  if (session && session.user.role === "students") {
    return <>Hello</>;
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
