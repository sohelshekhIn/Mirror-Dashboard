import "../styles/globals.css";
import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  let user = "sohel";
  useEffect(() => {
    if (user === null && !router.pathname.includes("/login")) {
      axios
        .get(`${process.env.NEXT_PUBLIC_STRAPI_API}/users/me`, {
          withCredentials: true,
        })
        .then((res) => {
          // setFetchUserStatus(true);
          // setUser(res.data);
          router.push("/dashboard");
        })
        .catch((err) => {
          if (
            err.response &&
            (err.response.status === 401 ||
              err.response.status === 403 ||
              err.response.status === 500)
          ) {
            if (router.pathname !== "/login") {
              router.push("/login");
            }
          }
        });
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
