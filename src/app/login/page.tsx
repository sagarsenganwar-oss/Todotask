import type { Metadata } from "next";
import { AuthForm } from "../auth-form";
import { login } from "../auth-actions";

export const metadata: Metadata = { title: "Log in · Todotask" };

export default function LoginPage() {
  return <AuthForm mode="login" action={login} />;
}
