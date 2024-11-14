// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    name: string;
  }

  interface Session {
    user: User & {
      id: string;
      username: string;
    };
  }
}

declare module "next-auth/jwt" {
    interface JWT {
      id: string;
      username: string;
    }
  }