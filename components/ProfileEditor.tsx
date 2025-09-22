"use client";
import React, { useState } from "react"

type RepertoireItem = { id: number; title: string; composer: string };
type MediaItem = { id: string; type: "video" | "image" | "audio"; url: string; name: string};

type Profile = {
  displayName: string;
  bio: string;
  location: string;
  voiceType: string;
  repertoire: RepertoireItem[];
  media: MediaItem[];
};

type Props = { currentUser: { id: string; name: string; role: string }};

export default function ProfileEditor({ currentUser }: Props) {
  const [profile, setProfile] = useState<Profile>({
    displayName: "Giulia Rossi",
    bio: "Young lyric soprano, conservatory graduate.",
    location: "Milan, Italy",
    voiceType: "Soprano",
    repertoire: [
      { id: 1, title: "Cherubino - Non so piu'", composer: "Mozart"},
      { id: 2, title: "Violetta - Sempre Libera", composer: "Verdi"},
    ],
    media: [],
  });

  function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 6);
    const newMedia: MediaItem[] = files.map((f, i) => ({
      id: `m_${Date.now()}_${i}`,
      type: f.type.startsWith("video") ? "video" : f.type.startsWith("image") ? "image" : "audio",
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setProfile((p) => ({ ...p, media: [...newMedia, ...p.media] }));
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

  function saveProfile() {
    alert("Profile saved (simulated)");
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white rounded p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Artist Profile</h2>
        <input className="w-full border rounded px-3 py-2 mb-3" value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value})} />
        <textarea className="w-full border rounded px-3 py-2 mb-3" rows={4} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value})} />
        <div className="flex gap-3">
          <input className="flex-1 border rounded px-3 py-2 mb-3" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
          <input className="w-40 border rounded px-3 py-2 mb-3" value={profile.voiceType} onChange={(e) => setProfile({ ...profile, voiceType: e.target.value })} />
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
          <button onClick={saveProfile} className="bg-green-600 text-white px-4 py-2 rounded">Save profile</button>
        </div>
      </div>
    </div>
  )
}