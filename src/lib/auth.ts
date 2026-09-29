import { supabase } from "@/lib/supabase";

export async function signIn(
  email: string,
  password: string
) {
  const {
    data,
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error);
    return null;
  }

  return data.user;
}

export async function requestPasswordReset(email: string) {
  const redirectTo = `${window.location.origin}/update-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    console.error("Password reset error:", error);
    return false;
  }

  return true;
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    console.error("Password update error:", error);
    return null;
  }

  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    return false;
  }

  return true;
}
