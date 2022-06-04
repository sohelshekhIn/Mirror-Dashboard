import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Loading from "./Loading";

export default function DashboardHandler({ session, wantUrl = false }) {
  const router = useRouter();
  if (session) {
    if (session.user && session.user.role === "student") {
      if (wantUrl) {
        return `${window.location.origin}/student/dashboard`;
      } else {
        router.push("/student/dashboard");
      }
    } else if (session.user && session.user.role === "faculty") {
      if (wantUrl) {
        return `${window.location.origin}/faculty/dashboard`;
      } else {
        router.push("/faculty/dashboard");
      }
    }
  } else {
    const { status, data } = useSession();
    if (status === "loading") {
      return <Loading />;
    }
    if (data) {
      if (data.user && data.user.role === "student") {
        if (wantUrl) {
          return `${window.location.origin}/student/dashboard`;
        } else {
          router.push("/student/dashboard");
        }
      } else if (data.user && data.user.role === "faculty") {
        if (wantUrl) {
          return `${window.location.origin}/faculty/dashboard`;
        } else {
          router.push("/faculty/dashboard");
        }
      }
    } else {
      if (wantUrl) {
        return `${window.location.origin}/dashboard`;
      } else {
        router.push("/dashboard");
      }
    }
  }

  return <Loading />;
}
