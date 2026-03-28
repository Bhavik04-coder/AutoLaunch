import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Twitter from 'next-auth/providers/twitter';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    // ── Google ────────────────────────────────────────────────────────────
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/youtube',
        },
      },
    }),

    // ── X / Twitter ───────────────────────────────────────────────────────
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID!,
      clientSecret: process.env.AUTH_TWITTER_SECRET!,
    }),

    // ── LinkedIn (OIDC + w_member_social for posting) ─────────────────────
    // Portal: https://www.linkedin.com/developers/apps → Auth tab
    // Redirect URI: http://localhost:4200/api/auth/callback/linkedin
    // Products: "Sign In with LinkedIn using OpenID Connect" + "Share on LinkedIn"
    {
      id: 'linkedin',
      name: 'LinkedIn',
      type: 'oidc',
      issuer: 'https://www.linkedin.com/oauth',
      authorization: {
        url: 'https://www.linkedin.com/oauth/v2/authorization',
        params: {
          scope: 'openid profile email w_member_social',
          response_type: 'code',
        },
      },
      token: {
        url: 'https://www.linkedin.com/oauth/v2/accessToken',
      },
      userinfo: {
        url: 'https://api.linkedin.com/v2/userinfo',
      },
      jwks_endpoint: 'https://www.linkedin.com/oauth/openid/jwks',
      client: {
        token_endpoint_auth_method: 'client_secret_post',
      },
      clientId: process.env.AUTH_LINKEDIN_ID!,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET!,
      checks: ['state'],
      profile(profile: any) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email ?? null,
          image: profile.picture ?? null,
        };
      },
    },

    // ── Facebook ──────────────────────────────────────────────────────────
    {
      id: 'facebook',
      name: 'Facebook',
      type: 'oauth',
      authorization: {
        url: 'https://www.facebook.com/v19.0/dialog/oauth',
        params: {
          scope: 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish',
          response_type: 'code',
        },
      },
      token: 'https://graph.facebook.com/v19.0/oauth/access_token',
      userinfo: 'https://graph.facebook.com/me?fields=id,name,email,picture',
      clientId: process.env.AUTH_FACEBOOK_ID!,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
      profile(profile: any) {
        return { id: profile.id, name: profile.name, email: profile.email ?? null, image: profile.picture?.data?.url ?? null };
      },
    },

    // ── Instagram ─────────────────────────────────────────────────────────
    {
      id: 'instagram',
      name: 'Instagram',
      type: 'oauth',
      authorization: {
        url: 'https://www.facebook.com/v19.0/dialog/oauth',
        params: {
          scope: 'public_profile,instagram_basic,instagram_content_publish,pages_show_list',
          response_type: 'code',
        },
      },
      token: 'https://graph.facebook.com/v19.0/oauth/access_token',
      userinfo: 'https://graph.facebook.com/me?fields=id,name,picture',
      clientId: process.env.AUTH_FACEBOOK_ID!,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
      profile(profile: any) {
        return { id: profile.id, name: profile.name, email: null, image: profile.picture?.data?.url ?? null };
      },
    },

    // ── YouTube ───────────────────────────────────────────────────────────
    {
      id: 'youtube',
      name: 'YouTube',
      type: 'oauth',
      authorization: {
        url: 'https://accounts.google.com/o/oauth2/v2/auth',
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/youtube',
          access_type: 'offline',
          prompt: 'consent',
          response_type: 'code',
        },
      },
      token: 'https://oauth2.googleapis.com/token',
      userinfo: 'https://www.googleapis.com/oauth2/v3/userinfo',
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      profile(profile: any) {
        return { id: profile.sub, name: profile.name, email: profile.email ?? null, image: profile.picture ?? null };
      },
    },
  ],

  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/third-party`;
    },
    async jwt({ token, account }) {
      if (account) {
        const connected = (token.connected as Record<string, { accessToken: string; connectedAt: number }>) ?? {};
        connected[account.provider] = {
          accessToken: account.access_token as string,
          connectedAt: Date.now(),
        };
        token.connected = connected;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.sub as string;
      (session as any).provider  = token.provider;
      (session as any).connected = token.connected ?? {};
      return session;
    },
  },

  pages: { signIn: '/auth/login' },
});
