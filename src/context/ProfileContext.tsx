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

const ProfileContext = createContext<ProfileContextType | undefined>(
  undefined
);

export function ProfileProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProfile(userId?: string) {
      if (!mounted) return;

      setLoading(true);

      let id = userId;

      if (!id) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error loading authenticated user:", userError);
        }

        id = user?.id;
      }

      if (!id) {
        if (mounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("Error loading profile:", error);
        setProfile(null);
      } else if (data) {
        setProfile({
          ...data,
          role: String(data.role ?? "").trim().toLowerCase(),
        });
      } else {
        setProfile(null);
      }

      setLoading(false);
    }

    void loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used inside ProfileProvider");
  }

  return context;
}
