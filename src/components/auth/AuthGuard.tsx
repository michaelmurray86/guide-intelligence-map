"use client";

import {
  useEffect,
  useState
} from "react";

import {
  useRouter
} from "next/navigation";

import {
  supabase
} from "@/lib/supabase";


export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {

  const router = useRouter();

  const [mounted, setMounted] =
    useState(false);

  const [authenticated, setAuthenticated] =
    useState(false);



  useEffect(() => {

    setMounted(true);


    async function checkUser(){

      const {
        data
      } = await supabase.auth.getSession();


      if(!data.session){

        router.push("/login");

      } else {

        setAuthenticated(true);

      }

    }


    checkUser();


  }, [router]);



  if(!mounted){

    return null;

  }


  if(!authenticated){

    return (

      <div className="flex min-h-screen items-center justify-center">

        Loading...

      </div>

    );

  }


  return children;

}