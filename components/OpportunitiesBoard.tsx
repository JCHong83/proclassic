"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";


type Opportunity = {
id: string;
title: string;
type: "audition" | "gig" | "competition";
location: string;
roleTags: string[];
level: string;
deadline: string;
payRange: string;
};


type Props = { currentUser: { id: string; name: string; role: string } };


export default function OpportunitiesBoard({ currentUser }: Props) {
const [opps, setOpps] = useState<Opportunity[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
async function load() {
setLoading(true);
setError(null);
const { data, error } = await supabase
.from("opportunities")
.select("*")
.order("deadline", { ascending: true });
if (error) {
setError(error.message);
setLoading(false);
return;
}
const mapped: Opportunity[] = (data ?? []).map((row: any) => ({
id: String(row.id ?? row.ID ?? row.uuid ?? ""),
title: row.title ?? row.name ?? "Untitled",
type: row.type ?? "gig",
location: row.location ?? row.city ?? "",
roleTags: Array.isArray(row.role_tags)
  ? row.role_tags
  : Array.isArray(row.roleTags)
  ? row.roleTags
  : [],
level: row.level ?? "",
deadline: row.deadline ?? row.closing_date ?? "",
payRange: row.pay_range ?? row.payRange ?? "",
}));
setOpps(mapped);
setLoading(false);
}
load();
}, []);


const [appliedIds, setAppliedIds] = useState<string[]>([]);


function apply(op: Opportunity) {
setAppliedIds((prev) => [...prev, op.id]);
alert(`Applied to ${op.title}`);
}


return (
<div className="bg-white rounded p-6 shadow">
<h2 className="text-lg font-semibold mb-3">Opportunity Board</h2>
{loading && (
<div className="text-sm text-gray-500">Loading opportunities…</div>
)}
{error && (
<div className="text-sm text-red-600">{error}</div>
)}
{!loading && !error && opps.length === 0 && (
<div className="text-sm text-gray-500">No opportunities found.</div>
)}
{opps.map((op) => (
<div key={op.id} className="p-3 border rounded flex justify-between items-center">
<div>
<div className="font-medium">{op.title}</div>
<div className="text-sm text-gray-600">{op.location} • {op.roleTags.join(", ")} • {op.level}</div>
<div className="text-xs text-gray-500">Deadline: {op.deadline} • Pay: {op.payRange}</div>
</div>
<button onClick={() => apply(op)} className="bg-indigo-600 text-white px-3 py-1 rounded">
{appliedIds.includes(op.id) ? "Applied" : "Apply"}
</button>
</div>
))}
</div>
);
}