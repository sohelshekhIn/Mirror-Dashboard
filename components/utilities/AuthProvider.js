import { signIn, useSession } from "next-auth/react";
import Loading from "./Loading";
import PageNotFound from "../../pages/404";

export default function AuthProvider({ children, role, required = true }) {
  const { status, data } = useSession();

  if (status === "loading") {
    return <Loading />;
  }

  if (!!required) {
    return children;
  }

  if (data == undefined) {
    return signIn();
  }
  if (data.user && data.user.role !== role) {
    return <PageNotFound />;
  }
  return children;
}
