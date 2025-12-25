import getUserByEmail from "../repositories/getUserByEmail.js";
import incrementFailedLoginAttempts from "../repositories/incrementFailedLoginAttempts.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import resetLoginAttempts from "../repositories/resetLoginAttempts.js";
import setUserLockUntil from "../repositories/setUserLockUntil.js";
import { AuthError } from "../error.js";

const secret = process.env.JWT_SECRET_KEY as string;

if (!secret) {
  throw new Error("A variável de ambiente JWT_SECRET_KEY não foi definida!");
}

interface SignInResult {
  user: {
    name: string;
    email: string;
  };
  token: string;
}
export default async function signInService(
  email: string,
  password: string
): Promise<SignInResult> {
  const user = await getUserByEmail(email);

  if (!user) throw new AuthError("Credenciais inválidas");

  const isLocked = user.lock_until && new Date(user.lock_until) > new Date();

  if (isLocked) throw new AuthError("Usuário temporariamente bloqueado");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const { login_attempts } = await incrementFailedLoginAttempts(email);

    if (login_attempts >= 5) {
      const lockUntilDate = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      await setUserLockUntil(lockUntilDate, email);

      throw new AuthError("Usuário temporariamente bloqueado");
    }

    throw new AuthError("Credenciais inválidas");
  }

  await resetLoginAttempts(email);

  const token = jwt.sign({ id: user.id, email }, secret, {
    expiresIn: "1h",
  });

  const {
    id,
    password: _,
    login_attempts,
    lock_until,
    ...userWithoutPassword
  } = user;

  return { user: userWithoutPassword, token };
}
