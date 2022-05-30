import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { logout } from "../../../../backend/src/api/custom/controllers/custom";

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
                error.response.data.error.details.messages.id ===
                "invalid_credentials"
              ) {
                console.log("Invalid credentials");
                throw new Error("Username or Password is incorrect");
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
        return {
          ...token,
          accessToken: user.user.jwt,
          user: {
            id: user.user.id,
            username: user.user.username,
            email: user.user.email,
            role: user.user.role.type,
          },
        };
      }
      return token;
    },
    async session({ session, token }) {
      session.user.accessToken = token.accessToken;
      session.user.id = token.user.id;
      session.user.username = token.user.username;
      session.user.email = token.user.email;
      session.user.role = token.user.role;
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
});
