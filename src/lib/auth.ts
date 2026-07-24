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


  if(error){

    console.error(
      "Login error:",
      error
    );

    return null;

  }


  return data.user;

}

export async function signOut(){

  const { error } =
    await supabase.auth.signOut();


  if(error){

    console.error(
      "Logout error:",
      error
    );

    return false;

  }


  return true;

}