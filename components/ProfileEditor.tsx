"use client";
import React, { useState } from "react"
import { supabase } from "../lib/supabaseClient"

type RepertoireItem = { id: number; title: string; composer: string };

type MediaItem = { id: string; type: "video" | "image" | "audio"; url: string; name: string };

type CareerItem = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description: string;
  mediaUrls: string[]; // images/videos hosted in storage
};

type Profile = {
  displayName: string;
  bio: string;
  location: string;
  voiceType: string;
  artistType: string;
  avatarUrl: string;
  repertoire: RepertoireItem[];
  media: MediaItem[];
  schools: string[];
  career: CareerItem[];
};

type Props = { currentUser: { id: string; name: string; role: string }};

export default function ProfileEditor({ currentUser }: Props) {
  const [profile, setProfile] = useState<Profile>({
    displayName: "Giulia Rossi",
    bio: "Young lyric soprano, conservatory graduate.",
    location: "Milan, Italy",
    voiceType: "Soprano",
    artistType: "Opera Singer",
    avatarUrl: "",
    repertoire: [
      { id: 1, title: "Cherubino - Non so piu'", composer: "Mozart"},
      { id: 2, title: "Violetta - Sempre Libera", composer: "Verdi"},
    ],
    media: [],
    schools: ["Conservatorio di Milano"],
    career: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadToBucket(bucket: string, file: File, pathPrefix: string): Promise<string> {
    const ext = file.name.split(".").pop() || "bin";
    const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, cacheControl: "3600" });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = (e.target.files && e.target.files[0]) || null;
    if (!file) return;
    try {
      setError(null);
      const publicUrl = await uploadToBucket("avatars", file, `avatars/${currentUser.id}`);
      setProfile((p) => ({ ...p, avatarUrl: publicUrl }));
    } catch (err: any) {
      setError(err.message || "Avatar upload failed");
    }
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 6);
    const uploads: Promise<MediaItem>[] = files.map(async (f, i) => {
      const publicUrl = await uploadToBucket("artist-media", f, `media/${currentUser.id}`);
      return {
        id: `m_${Date.now()}_${i}`,
        type: f.type.startsWith("video") ? "video" : f.type.startsWith("image") ? "image" : "audio",
        url: publicUrl,
        name: f.name,
      } as MediaItem;
    });
    try {
      setError(null);
      const newMedia = await Promise.all(uploads);
      setProfile((p) => ({ ...p, media: [...newMedia, ...p.media] }));
    } catch (err: any) {
      setError(err.message || "Media upload failed");
    }
  }

  function addRepertoire() {
    const nextId = Date.now();
    setProfile((p) => ({ ...p, repertoire: [...p.repertoire, {id: nextId, title: "New Aria", composer: ""}] }));
  }

  function updateRepertoire(id: number, field: keyof RepertoireItem, value: string) {
    setProfile((p) => ({ ...p, repertoire: p.repertoire.map((r) => (r.id === id ? { ...r, [field]: value } : r)) }));
  }

  function removeRepertoire(id: number) {
    setProfile((p) => ({ ...p, repertoire: p.repertoire.filter((r) => r.id !== id) }));
  }

  function addSchool(school: string) {
    if (!school.trim()) return;
    setProfile((p) => ({ ...p, schools: [...p.schools, school.trim()] }));
  }

  function removeSchool(idx: number) {
    setProfile((p) => ({ ...p, schools: p.schools.filter((_, i) => i !== idx) }));
  }

  function addCareer() {
    const id = `c_${Date.now()}`;
    setProfile((p) => ({ ...p, career: [{ id, title: "New milestone", date: new Date().toISOString().slice(0,10), description: "", mediaUrls: [] }, ...p.career] }));
  }

  function updateCareer(id: string, field: keyof CareerItem, value: string) {
    setProfile((p) => ({ ...p, career: p.career.map((c) => (c.id === id ? { ...c, [field]: value } : c)) }));
  }

  async function addCareerMedia(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = (e.target.files && e.target.files[0]) || null;
    if (!file) return;
    try {
      setError(null);
      const publicUrl = await uploadToBucket("artist-media", file, `career/${currentUser.id}/${id}`);
      setProfile((p) => ({ ...p, career: p.career.map((c) => (c.id === id ? { ...c, mediaUrls: [publicUrl, ...c.mediaUrls] } : c)) }));
    } catch (err: any) {
      setError(err.message || "Career media upload failed");
    }
  }

  async function saveProfile() {
    try {
      setSaving(true);
      setError(null);
      const payload = {
        id: currentUser.id,
        display_name: profile.displayName,
        bio: profile.bio,
        location: profile.location,
        voice_type: profile.voiceType,
        artist_type: profile.artistType,
        avatar_url: profile.avatarUrl,
        schools: profile.schools,
        repertoire: profile.repertoire,
        media: profile.media,
        career: profile.career,
        updated_at: new Date().toISOString(),
      };
      const { error: upsertError } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
      if (upsertError) throw upsertError;
      alert("Profile saved");
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white rounded p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Artist Profile</h2>

        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Avatar</div>
            )}
          </div>
          <label className="text-sm">
            <span className="block mb-1">Profile picture</span>
            <input type="file" accept="image/*" onChange={handleAvatarUpload} />
          </label>
        </div>

        <input className="w-full border rounded px-3 py-2 mb-3" placeholder="Display name" value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value})} />
        <input className="w-full border rounded px-3 py-2 mb-3" placeholder="Type of artist (e.g., Opera Singer, Pianist)" value={profile.artistType} onChange={(e) => setProfile({ ...profile, artistType: e.target.value})} />
        <textarea className="w-full border rounded px-3 py-2 mb-3" rows={4} placeholder="Bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value})} />
        <div className="flex gap-3">
          <input className="flex-1 border rounded px-3 py-2 mb-3" placeholder="Location" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
          <input className="w-40 border rounded px-3 py-2 mb-3" placeholder="Voice/Type" value={profile.voiceType} onChange={(e) => setProfile({ ...profile, voiceType: e.target.value })} />
        </div>

        <h3 className="mt-4 font-medium">Schools attended</h3>
        <SchoolEditor schools={profile.schools} onAdd={addSchool} onRemove={removeSchool} />

        <h3 className="mt-6 font-medium">Repertoire</h3>
        <div className="space-y-2">
          {profile.repertoire.map((r) => (
            <div key={r.id} className="flex gap-2">
              <input className="flex-1 border rounded px-2 py-1" placeholder="Title/Role" value={r.title} onChange={(e) => updateRepertoire(r.id, "title", e.target.value)} />
              <input className="w-64 border rounded px-2 py-1" placeholder="Composer" value={r.composer} onChange={(e) => updateRepertoire(r.id, "composer", e.target.value)} />
              <button className="text-red-600" onClick={() => removeRepertoire(r.id)}>Remove</button>
            </div>
          ))}
          <button className="text-indigo-600" onClick={addRepertoire}>+ Add repertoire</button>
        </div>

        <h3 className="mt-6 font-medium">Career moments</h3>
        <div className="space-y-3">
          {profile.career.map((c) => (
            <div key={c.id} className="border rounded p-3">
              <div className="flex gap-2 mb-2">
                <input className="flex-1 border rounded px-2 py-1" placeholder="Title" value={c.title} onChange={(e) => updateCareer(c.id, "title", e.target.value)} />
                <input className="w-44 border rounded px-2 py-1" type="date" value={c.date} onChange={(e) => updateCareer(c.id, "date", e.target.value)} />
              </div>
              <textarea className="w-full border rounded px-2 py-1 mb-2" rows={2} placeholder="Description" value={c.description} onChange={(e) => updateCareer(c.id, "description", e.target.value)} />
              <div className="flex items-center gap-3">
                <label className="text-sm">
                  <span className="block mb-1">Add image/video</span>
                  <input type="file" accept="image/*,video/*" onChange={(e) => addCareerMedia(c.id, e)} />
                </label>
                <div className="flex gap-2 overflow-x-auto">
                  {c.mediaUrls.map((u) => (
                    <div key={u} className="w-20 h-20 bg-gray-100 rounded overflow-hidden">
                      {u.match(/\.(mp4|mov|webm)$/i) ? (
                        <video src={u} className="w-full h-full object-cover" />
                      ) : (
                        <img src={u} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <button className="text-indigo-600" onClick={addCareer}>+ Add career moment</button>
        </div>

        <h3 className="mt-6 font-medium">Media</h3>
        <input type="file" accept="video/*,image/*,audio/*" multiple onChange={handleMediaUpload} />

        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {profile.media.map((m) => (
            <div key={m.id} className="bg-gray-100 rounded p-2">
              {m.type === "image" && <img src={m.url} alt={m.name} className="w-full h-36 object-cover rounded" />}
              {m.type === "video" && <video src={m.url} controls className="w-full h-36 object-cover rounded" />}
              {m.type === "audio" && <audio src={m.url} controls className="w-full" />}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={saveProfile} disabled={saving} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60">{saving ? "Saving..." : "Save profile"}</button>
        </div>
      </div>
    </div>
  )
}

function SchoolEditor({ schools, onAdd, onRemove }: { schools: string[]; onAdd: (s: string) => void; onRemove: (idx: number) => void }) {
  const [value, setValue] = useState("");
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input className="flex-1 border rounded px-2 py-1" placeholder="Add school (e.g., Juilliard School)" value={value} onChange={(e) => setValue(e.target.value)} />
        <button className="text-indigo-600" onClick={() => { onAdd(value); setValue(""); }}>Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {schools.map((s, i) => (
          <span key={`${s}-${i}`} className="inline-flex items-center gap-2 bg-gray-100 rounded px-2 py-1 text-sm">
            {s}
            <button className="text-red-600" onClick={() => onRemove(i)}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}