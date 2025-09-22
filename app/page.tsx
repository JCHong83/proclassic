import OpportunitiesBoard from "@/components/OpportunitiesBoard";

export default function HomePage() {
  const currentUser = { id: "artist_1", name: "Giulia Rossi", role: "artist" };
  return <OpportunitiesBoard currentUser={currentUser} />;
}