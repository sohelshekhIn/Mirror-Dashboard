import { useSession, getSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Loading from "../components/utilities/Loading";

export default function Index() {
  const router = useRouter();
  const { data: session } = useSession();
  useState(() => {
    if (typeof window === "undefined") return null;
  });
  const changeRoute = () => {
    useEffect(() => {
      router.push("/dashboard");
    }, []);
  };
  if (session) {
    changeRoute();
    // return <Loading />;
    return <Loading />;
  }
  signIn();
  return;
}

export async function getServerSideProps(context) {
  return {
    props: {
      session: await getSession(context),
    },
  };
}
