"use client";

import {
  useState
} from "react";

import {
  signIn
} from "@/lib/auth";

import {
  useRouter
} from "next/navigation";


export default function LoginPage(){

  const router = useRouter();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");


  async function handleLogin(){

    console.log("Login clicked");

    const user = await signIn(
      email,
      password
    );

    console.log(
      "User returned:",
      user
    );


    if(user){

      router.push("/");

    } else {

      setError(
        "Invalid email or password"
      );

    }

  }


  return (

    <div
      style={{
        position: "relative",
        zIndex: 9999,
      }}
      className="flex min-h-screen items-center justify-center"
    >

      <div className="w-96 space-y-4">

        <h1 className="text-2xl font-bold">
          Guide Intelligence Login
        </h1>


        <input
          className="border p-2 w-full"
          placeholder="Email"
          value={email}
          onChange={
            e => setEmail(e.target.value)
          }
        />


        <input
          className="border p-2 w-full"
          placeholder="Password"
          type="password"
          value={password}
          onChange={
            e => setPassword(e.target.value)
          }
        />


        <button
          type="button"
          className="bg-black text-white p-3 w-full cursor-pointer"
          onClick={handleLogin}
        >
          LOGIN
        </button>


        {
          error &&
          <p className="text-red-600">
            {error}
          </p>
        }


      </div>

    </div>

  );

}