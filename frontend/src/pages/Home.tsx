import { useUser } from "../AuthProvider";

export default function Home() {
  const { user } = useUser();

  console.log(user);

  return (
    <div>
      <h1>Home page</h1>
      <p>{user ? `Name: ${user.name}` : ""}</p>
      <p>{user ? `Email: ${user.email}` : ""}</p>
    </div>
  );
}
