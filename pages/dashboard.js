import { useSession, signIn } from "next-auth/react";
import PageNotFound from "./404";
import Loading from "../components/utilities/Loading";
import DashboardHandler from "../components/utilities/DashbordHandler";

export default function Dashboard() {
  const { status, data } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });

  if (status === "loading") {
    return <Loading />;
  }

  // This Dashboard is resposible to drive the loged in user to its dashboard url base on its role
  if (data.user) {
    DashboardHandler({ session: data });
  } else if (data.user) {
    return <PageNotFound />;
  }
}
