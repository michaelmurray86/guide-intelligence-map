"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { supabase } from "@/lib/supabase";


type Profile = {

  id: string;

  name: string;

  email: string;

  role: string;

  created_at: string;

};



type ProfileContextType = {

  profile: Profile | null;

  loading: boolean;

};



const ProfileContext =
  createContext<ProfileContextType | undefined>(
    undefined
  );



export function ProfileProvider({
  children,
}: {
  children: ReactNode;
}) {


  const [profile, setProfile] =
    useState<Profile | null>(null);


  const [loading, setLoading] =
    useState(true);



  useEffect(() => {


    async function loadProfile(){


      const {
        data:{
          user
        }
      } =
      await supabase.auth.getUser();



      if(!user){

        setLoading(false);

        return;

      }



      const {
        data,
        error
      } =
      await supabase

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


      setProfile(data);


      setLoading(false);


    }


    loadProfile();


  }, []);



  return (

    <ProfileContext.Provider
      value={{
        profile,
        loading,
      }}
    >

      {children}

    </ProfileContext.Provider>

  );

}



export function useProfile(){


  const context =
    useContext(ProfileContext);



  if(!context){

    throw new Error(
      "useProfile must be used inside ProfileProvider"
    );

  }


  return context;


}