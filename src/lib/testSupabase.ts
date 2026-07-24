import { supabase } from "./supabase";


export async function testSupabase(){

  const { data, error } =
    await supabase
      .from("test")
      .select("*");


  console.log(data);
  console.log(error);

}