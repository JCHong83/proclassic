"use client";

import React, { useState } from "react";


type Applicant = { id: string; name: string; profileSummary: string };


type Opportunity = {
  id: string;
  title: string;
  type: string;
  location: string;
  roleTags: string[];
  level: string;
  deadline: string;
  payRange: string;
  applicants: Applicant[];
};


export default function InstitutionDashboard() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>
  ([
    { 
      id: "org_op_1", 
      title: "Chorus auditions", 
      type: "audition", 
      location: "Florence", 
      roleTags: ["Chorus"], 
      level: "amateur", 
      deadline: "2025-09-28", 
      payRange: "€0-€100", 
      applicants: [{ id: "a1", name: "Marco", profileSummary: "Tenor" }]
    },
  ]);


return (
  <div className="bg-white rounded p-6 shadow">
    <h2 className="text-lg font-semibold">Institution Dashboard</h2>
    {opportunities.map((op) => (
      <div key={op.id} className="p-3 border rounded flex justify-between items-center">
        <div>
          <div className="font-medium">
            {op.title}
          </div>
          <div className="text-sm text-gray-600">
            {op.location} • {op.roleTags.join(", ")} • {op.level}
          </div>
        </div>
        <button className="border px-3 py-1 rounded">
          Applicants ({op.applicants.length})
        </button>
      </div>
    ))}
  </div>
);
}