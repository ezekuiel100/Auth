import { useEffect, useState } from "react";
import { useUser } from "../AuthProvider";
import { useNavigate } from "react-router";

export default function Home() {
  const { user, signOut, updateUser } = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(user);
    }
  }, [user]);

  if (!user) {
    return <p>Carregando ou usuário não autenticado...</p>;
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/user/update", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        alert("Sua sessão expirou!");
        navigate("/login");
        return;
      }

      if (!res.ok) return;

      const data = await res.json();
      console.log(data);

      updateUser(form);
      setIsEditing(false);
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.log(error);
    }
  }

  async function handleSignOut() {
    try {
      const res = await fetch("http://localhost:3000/auth/signout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Falha ao encerrar sessão no servidor");
      }

      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error("Erro de rede ao tentar sair:", error);
    } finally {
      signOut();
      navigate("/login");
    }
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Bem-vindo, {user.name}!</h1>

      <section
        style={{
          marginBottom: "20px",
          border: "1px solid #ddd",
          padding: "15px",
        }}
      >
        <h3>Seus Dados</h3>
        {isEditing ? (
          <form
            onSubmit={handleUpdate}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <label>
              Nome:
              <input
                style={{ padding: "5px" }}
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </label>
            <label>
              Email:
              <input
                style={{ padding: "5px" }}
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </label>
            <button type="submit">Salvar</button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancelar
            </button>
          </form>
        ) : (
          <div>
            <p>
              <strong>Nome:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <button onClick={() => setIsEditing(true)}>Editar Perfil</button>
          </div>
        )}
      </section>

      <hr />

      <button
        onClick={handleSignOut}
        style={{
          backgroundColor: "#ff4444",
          color: "white",
          border: "none",
          padding: "10px",
          cursor: "pointer",
        }}
      >
        Sair da conta
      </button>
    </div>
  );
}
