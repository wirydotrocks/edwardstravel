/**
 * Team roster for the About page. Edit this file to add, remove, or change members.
 * - `imageSrc`: path under /public (e.g. "/team/jane.jpg") or a full URL; omit for placeholder avatar
 * - `id`: stable slug, unique — used for React keys
 * - `info`: contact details shown on the back of the flip card
 */
export type TeamMember = {
  id: string;
  name: string;
  /** Short line under the name (e.g. job title) */
  role: string;
  imageSrc?: string;
  /** Shown on the back of the card */
  bio: string;
  info: {
    email: string;
    /** Display format, e.g. (555) 123-4567 */
    phone: string;
  };
};

export const teamMembers: TeamMember[] = [
  {
    id: "edward-usita",
    name: "Edward Usita",
    role: "Founder & lead advisor",
    imageSrc: "/team/edward-usita.png",
    bio: "Edward founded the agency with a focus on thoughtful itineraries and personal service.",
    info: {
      email: "edward@edwardstravel.com",
      phone: "(757) 431-8624",
    },
  },
  {
    id: "jane-sample",
    name: "Jane Sample",
    role: "Travel designer",
    bio: "Placeholder copy: Jane specializes in family and multi-generational trips. Swap in your story, credentials, and what clients love about working with her.",
    info: {
      email: "jane@edwardstravel.com",
      phone: "(555) 100-1002",
    },
  },
  {
    id: "alex-sample",
    name: "Alex Sample",
    role: "Operations",
    bio: "Placeholder copy: Alex keeps bookings and details running smoothly. Update with a real bio and photo when ready.",
    info: {
      email: "alex@edwardstravel.com",
      phone: "(555) 100-1003",
    },
  },
];
