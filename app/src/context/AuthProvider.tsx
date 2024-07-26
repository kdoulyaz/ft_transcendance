import { createContext, useState } from "react";
import { Profile } from "../types";

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

type Auth = {
  auth?: Tokens;
  user?: Profile;
  setAuth?: (auth: Tokens) => void;
  setUser?: (user: Profile) => void;
};

const AuthContext = createContext<Auth>({});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<Tokens>({} as Tokens);
  const [user, setUser] = useState<Profile>({} as Profile);

  return (
    <AuthContext.Provider value={{ auth, setAuth, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
