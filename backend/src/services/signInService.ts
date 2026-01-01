import getUserByEmail from "../repositories/getUserByEmail.js";
import incrementFailedLoginAttempts from "../repositories/incrementFailedLoginAttempts.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import resetLoginAttempts from "../repositories/resetLoginAttempts.js";
import setUserLockUntil from "../repositories/setUserLockUntil.js";
import { AuthError } from "../error.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("A variável de ambiente SECRET_KEY não foi definida!");
}
interface SignInResult {
  user: {
    name: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
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

  const accessToken = jwt.sign({ id: user.id, email }, ACCESS_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ id: user.id, email }, REFRESH_SECRET, {
    expiresIn: "1h",
  });

  const {
    id,
    password: _,
    login_attempts,
    lock_until,
    ...userWithoutPassword
  } = user;

  return { user: userWithoutPassword, accessToken, refreshToken };
}
