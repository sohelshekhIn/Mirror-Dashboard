import "../styles/globals.css";
import { SessionProvider, useSession } from "next-auth/react";
import Head from "next/head";
import NavProvider from "../components/utilities/NavProvider";
import Loading from "../components/utilities/Loading";
import { useEffect } from "react";
import PageNotFound from "./404";

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}) {
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
          <Component {...pageProps} />
        </NavProvider>
      </SessionProvider>
    </>
  );
}
