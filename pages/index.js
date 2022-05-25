import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("/login");
  });

  return (
    <>
      <center>
        <h1 className="mt-28 text-5xl text-primary font-bold">
          Redirecting to Login Page...
        </h1>
      </center>
    </>
  );
}
