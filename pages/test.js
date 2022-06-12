// import { useSession, signOut, getSession, signIn } from "next-auth/react";
// import { useState } from "react";
// import PageNotFound from "./404";

// export default function Test() {
//   const { data: session } = useSession();
//   useState(() => {
//     if (typeof window === "undefined") return null;
//   });
//   if (session && session.user.role === "student") {
//     return <>Hello</>;
//   }
//   return <PageNotFound />;
// }

// export async function getServerSideProps(context) {
//   return {
//     props: {
//       session: await getSession(context),
//     },
//   };
// }

export default function Test() {
  return (
    <>
      <div className="hiden md:max-w-md xs:max-w-sm lg:max-w-xl m-5 p-5  bg-primary translate-y-96 max-w-xs"></div>
      <div className="hiden alert alert-success "></div>
      <div className="hiden alert alert-info"></div>
      <div className="hiden alert  alert-error"></div>
      <div className="hiden alert  alert-warning"></div>
      <center>
        <h1>Testing...</h1>
      </center>
    </>
  );
}
