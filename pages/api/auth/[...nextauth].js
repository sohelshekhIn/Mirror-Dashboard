import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

var error = "";
export default NextAuth({
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "NextAuthBackendApi Mirror",
      credentials: {
        identifier: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        return (
          axios
            .post(`${process.env.NEXT_PUBLIC_STRAPI_API}/auth/login`, {
              identifier: credentials.identifier,
              password: credentials.password,
            })
            .then((response) => {
              return response.data;
            })
            .catch((error) => {
              if (
                error.response &&
                error.response.data.error.details.messages.id ===
                  "invalid_credentials"
              ) {
                throw new Error("Invalid Credentials");
              } else if (error.code) {
                // Handle all axios errors here
                if (error.code === "ECONNREFUSED") {
                  throw new Error("Connection refused");
                }
              }
            }) || null
        );
      },
    }),
  ],
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        let batch = null;
        if (user.user.role.type === "student") {
          batch = user.user.batch.batch;
        }
        return {
          ...token,
          accessToken: user.jwt,
          user: {
            id: user.user.UserID,
            name: user.user.name,
            username: user.user.username,
            email: user.user.email,
            role: user.user.role.type,
            batch: batch,
          },
        };
      }
      return token;
    },
    async session({ session, token }) {
      session.user.accessToken = token.accessToken;
      session.user.id = token.user.id;
      session.user.name = token.user.name;
      session.user.username = token.user.username;
      session.user.email = token.user.email;
      session.user.role = token.user.role;
      session.user.batch = token.user.batch;
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
});
