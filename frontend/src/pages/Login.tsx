import { useState } from "react";
import { useUser } from "../AuthProvider";
import { useNavigate } from "react-router";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const { setUser } = useUser();
  const navigate = useNavigate();

  async function handleSignIng() {
    try {
      const res = await fetch("http://localhost:3000/auth/signin", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        console.log("Erro no login");
        return;
      }

      const data = await res.json();
      setUser(data.user);
      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log("Erro de rede:", err.message);
      } else {
        console.log("Ocorreu um erro desconhecido", err);
      }
    }
  }

  return (
    <form className="login">
      <h1>Faça login</h1>
      <input
        type="text"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="Email"
      />
      <input
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        placeholder="Senha"
      />
      <button type="submit" onClick={handleSignIng}>
        Entrar
      </button>

      <a href="#">Criar conta</a>
    </form>
  );
}
