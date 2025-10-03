"use client";
import ProfileEditor from "@/components/ProfileEditor";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Role = "basic" | "artist" | "institution";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setRole(null);
        setLoading(false);
        return;
      }
      loadRole(uid);
    });

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      await loadRole(uid);
    }

    async function loadRole(uid: string) {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setRole((data?.role as Role) || "basic");
      setLoading(false);
    }

    init();
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading…</div>;
  }
  if (!userId) {
    return <div>Please sign in to view your profile.</div>;
  }
  if (role !== "artist") {
    return <div>You don’t have access to the artist profile editor.</div>;
  }
  return <ProfileEditor currentUser={{ id: userId, role: role }} />;
}