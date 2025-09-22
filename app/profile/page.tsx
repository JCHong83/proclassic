import ProfileEditor from "@/components/ProfileEditor";

export default function ProfilePage() {
  const currentUser = { id: "artist_1", name: "Giulia Rossi", role: "artist" };
  return <ProfileEditor currentUser={currentUser} />;
}