import type { Metadata } from "next";
import { AuthForm } from "../auth-form";
import { signup } from "../auth-actions";

export const metadata: Metadata = { title: "Sign up · Todotask" };

export default function SignupPage() {
  return <AuthForm mode="signup" action={signup} />;
}
