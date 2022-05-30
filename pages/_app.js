import "../styles/globals.css";
import { useEffect } from "react";
import { SessionProvider, useSession, signIn } from "next-auth/react";

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
    // <SessionProvider session={session}>
    //   <Component {...pageProps} />
    //   {Component.isProtected ? (
    //     <Auth>
    //       <Component {...pageProps} />
    //     </Auth>
    //   ) : (
    //     <Component {...pageProps} />
    //   )}
    // </SessionProvider>
  );
}

function Auth({ children }) {
  const { data: session, status } = useSession();
  const isUser = !!session?.user;
  useEffect(() => {
    console.log(status);
    console.log(isUser);
    if (status === "loading") return;
    if (!isUser) signIn();
  }, [isUser, status]);

  if (isUser) {
    return children;
  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return <div>Loading...</div>;
}
