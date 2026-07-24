import AuthGuard from "@/components/auth/AuthGuard";
import AppLayout from "@/components/layout/AppLayout";


export default function Home() {

  return (

    <AuthGuard>

      <AppLayout />

    </AuthGuard>

  );

}