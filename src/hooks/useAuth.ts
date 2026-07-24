"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  supabase
} from "@/lib/supabase";

import {
  User
} from "@supabase/supabase-js";


export function useAuth(){

  const [user, setUser] =
    useState<User | null>(null);


  const [loading, setLoading] =
    useState(true);



  useEffect(() => {


    async function getUser(){

      const {
        data
      } =
        await supabase.auth.getUser();


      setUser(
        data.user ?? null
      );


      setLoading(false);

    }


    getUser();



    const {
      data: listener
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {


          setUser(
            session?.user ?? null
          );


        }
      );



    return () => {

      listener.subscription.unsubscribe();

    };


  }, []);



async function logout(){

  await supabase.auth.signOut();

  setUser(null);

}



  return {

    user,

    loading,

    logout,

  };


}