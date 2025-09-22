"use client";
import React, { useState } from "react";


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
const [opps] = useState<Opportunity[]>([
{ id: "op_1", title: "Young Artist Program", type: "audition", location: "Florence", roleTags: ["Soprano"], level: "young-artist", deadline: "2025-10-01", payRange: "stipend" },
]);


const [appliedIds, setAppliedIds] = useState<string[]>([]);


function apply(op: Opportunity) {
setAppliedIds((prev) => [...prev, op.id]);
alert(`Applied to ${op.title}`);
}


return (
<div className="bg-white rounded p-6 shadow">
<h2 className="text-lg font-semibold mb-3">Opportunity Board</h2>
{opps.map((op) => (
<div key={op.id} className="p-3 border rounded flex justify-between items-center">
<div>
<div className="font-medium">{op.title}</div>
<div className="text-sm text-gray-600">{op.location} • {op.roleTags.join(", ")} • {op.level}</div>
</div>
<button onClick={() => apply(op)} className="bg-indigo-600 text-white px-3 py-1 rounded">
{appliedIds.includes(op.id) ? "Applied" : "Apply"}
</button>
</div>
))}
</div>
);
}