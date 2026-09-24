import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';
import { adminLoginRoute, loginRoute, verifyOtpRoute } from '../../../utils/apiRoutes';

const nextAuthSecret =
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === "development" ? "marble-store-local-nextauth-secret" : undefined);

export const authOptions = {
  pages: {
    signIn: '/',
  },

  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        phone_number: { type: 'text' },
        password: { type: 'password' },
        otp_id: { type: 'text' },
        code: { type: 'text' },
        purpose: { type: 'text' },
        full_name: { type: 'text' },
        auth_mode: { type: 'text' },
      },
      async authorize(credentials) {
        try {
          const authMode = credentials?.auth_mode || 'password';
          let response;

          if (authMode === 'otp') {
            response = await axios.post(verifyOtpRoute, {
              phone_number: credentials.phone_number,
              otp_id: credentials.otp_id,
              code: credentials.code,
              purpose: credentials.purpose || 'login',
              ...(credentials.full_name
                ? { full_name: credentials.full_name }
                : {}),
            });
          } else if (authMode === 'admin') {
            response = await axios.post(adminLoginRoute, {
              phone_number: credentials.phone_number,
              password: credentials.password,
            });
          } else {
            response = await axios.post(loginRoute, {
              phone_number: credentials.phone_number,
              password: credentials.password,
            });
          }

          if (response.status === 200 || response.status === 201) {
            return {
              token: response.data.token,
              ...response.data.user,
              id: response.data.user.id,
            };
          }
          return null;
        } catch (error) {
          console.error("An error occurred:", error?.response?.data || error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.accessToken = user.token;
        token.user = {
          id: user.id,
          full_name: user.full_name,
          phone_number: user.phone_number,
          role: user.role
        };
      }
      if (trigger === "update" && session) {
        token.user = {
          ...(token.user || {}),
          ...session,
        };
      }
      return token;
    },

    async session({ session, token }) {
      session.user = token.user;
      session.user.accessToken = token.accessToken;
      return session;
    },
  },

  secret: nextAuthSecret
};

export default NextAuth(authOptions);
