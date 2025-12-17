import { useState } from "react";
import "./App.css";

function App() {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  async function handleSignIng() {
    try {
      const res = await fetch("http://localhost:3000/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (!res.ok) {
        console.log("Erro no login");
        return;
      }

      const data = await res.json();
      console.log(data);
    } catch (err: unknown) {
      console.log("Erro de rede:", err.message);
    }
  }

  return (
    <div className="login">
      <h1>Faça login</h1>
      <input
        type="text"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        placeholder="Email"
      />
      <input
        type="password"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
        placeholder="Senha"
      />
      <button onClick={handleSignIng}>Entrar</button>

      <a href="#">Criar conta</a>
    </div>
  );
}

export default App;
