import { createContext, useContext, useState, type ReactNode } from "react";

interface User {
  name: string;
  email: string;
}

interface UserCcntextType {
  user: User | null;
  signIn: (data: User) => void;
  signOut: () => void;
}

const UserContext = createContext<UserCcntextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user_data");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  function signIn(data: User) {
    setUser(data);
    localStorage.setItem("user_data", JSON.stringify(data));
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem("user_data");
  }

  return (
    <UserContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

/* eslint-disable */
export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}
