import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import Head from "next/head";
import NavProvider from "../components/utilities/NavProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const [history, setHistory] = useState(["/"]);
  const router = useRouter();

  useEffect(() => {
    // only have previos path and current path, remove old paths as new is added
    setHistory([history, router.pathname]);
    console.log(history);
  }, [router]);
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        ></meta>
      </Head>
      <SessionProvider session={session}>
        <NavProvider>
          <Component history={history} {...pageProps} />
        </NavProvider>
      </SessionProvider>
    </>
  );
}
