import "../styles/globals.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_STRAPI_API}/users/me`, {
        withCredentials: true,
      })
      .then((res) => {
        setUser(res.data);
        router.push("/dashboard");
      })
      .catch((err) => {
        console.log(err);
        if (
          (err.response && err.response.status === 401) ||
          err.response.status === 403 ||
          err.response.status === 500
        ) {
          if (router.pathname !== "/login") {
            router.push("/login");
          }
        }
      });
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
