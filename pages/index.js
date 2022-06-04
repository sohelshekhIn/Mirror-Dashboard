import { useSession, signIn } from "next-auth/react";
import DashboardHandler from "../components/utilities/DashbordHandler";
import Loading from "../components/utilities/Loading";
import PageNotFound from "./404";

export default function Index() {
  const { status, data } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });
  if (status === "loading") {
    return <Loading />;
  }
  console.log(data);
  return DashboardHandler({ data });
}
