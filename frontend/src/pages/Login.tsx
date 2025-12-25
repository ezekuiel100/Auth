import { useState } from "react";
import { useUser } from "../AuthProvider";
import { useNavigate } from "react-router";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useUser();

  const navigate = useNavigate();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3000/auth/signin", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setError(data.message || "E-mail ou senha inválidos.");
        } else if (res.status === 500) {
          setError(
            "O sistema está temporariamente fora do ar. Tente mais tarde."
          );
        } else {
          setError(
            data.message ||
              "Algo deu errado. Verifique os dados e tente novamente."
          );
        }
        return;
      }

      signIn(data.user);
      navigate("/");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("Erro de rede:", error.message);
      } else {
        console.log("Ocorreu um erro desconhecido", error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="login" onSubmit={handleSignIn}>
      <h1>Faça login</h1>
      <input
        type="email"
        required
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="Email"
      />
      <input
        type="password"
        required
        minLength={8}
        maxLength={30}
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        placeholder="Senha"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Carregando..." : "Entrar"}
      </button>

      {error?.length > 0 && <div className="error">{error}</div>}

      <a href="#">Criar conta</a>
    </form>
  );
}
