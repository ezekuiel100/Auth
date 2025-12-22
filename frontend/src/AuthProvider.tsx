import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface User {
  name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  signIn: (data: User) => void;
  signOut: () => void;
  updateUser: (newData: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("user_data");
      if (!saved) return null;

      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user_data") {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  function signIn(data: User) {
    setUser(data);
    localStorage.setItem("user_data", JSON.stringify(data));
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem("user_data");
  }

  function updateUser(newData: User) {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updated = { ...prevUser, ...newData };

      localStorage.setItem("user_data", JSON.stringify(updated));

      return updated;
    });
  }

  return (
    <UserContext.Provider value={{ user, signIn, signOut, updateUser }}>
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
