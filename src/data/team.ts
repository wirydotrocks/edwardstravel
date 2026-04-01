/**
 * Team roster for the About page. Edit this file to add, remove, or change members.
 * - `imageSrc`: path under /public (e.g. "/team/jane.jpg") or a full URL allowed in next.config.ts
 * - `id`: stable slug, unique — used for React keys
 * - `info`: contact details shown on the back of the flip card
 */
export type TeamMember = {
  id: string;
  name: string;
  /** Short line under the name (e.g. job title) */
  role: string;
  imageSrc: string;
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
    id: "edward-sample",
    name: "Edward Sample",
    role: "Founder & lead advisor",
    imageSrc:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
    bio: "Placeholder copy: Edward founded the agency with a focus on thoughtful itineraries and personal service. Replace this paragraph with a real bio.",
    info: {
      email: "edward@edwardstravel.com",
      phone: "(555) 100-1001",
    },
  },
  {
    id: "jane-sample",
    name: "Jane Sample",
    role: "Travel designer",
    imageSrc:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
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
    imageSrc:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
    bio: "Placeholder copy: Alex keeps bookings and details running smoothly. Update with a real bio and photo when ready.",
    info: {
      email: "alex@edwardstravel.com",
      phone: "(555) 100-1003",
    },
  },
];
