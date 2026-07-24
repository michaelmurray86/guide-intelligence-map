"use client";

import {
  useEffect,
  useState
} from "react";

import {
  supabase
} from "@/lib/supabase";


type Profile = {

  id: string;

  name: string;

  email: string;

  role: string;

  created_at: string;

};



export function useProfile(){

  const [profile, setProfile] =
    useState<Profile | null>(null);


  const [loading, setLoading] =
    useState(true);



  useEffect(() => {


    async function loadProfile(){


      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();



      if(!user){

        setLoading(false);

        return;

      }



      const {
        data,
        error
      } = await supabase

        .from("profiles")

        .select("*")

        .eq(
          "id",
          user.id
        )

        .single();



      if(error){

        console.error(
          "Error loading profile:",
          error
        );

      }


      if(data){

        setProfile(data);

      }


      setLoading(false);


    }


    loadProfile();


  }, []);



  return {

    profile,

    loading,

  };

}