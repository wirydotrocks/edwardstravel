export type OfficeLocation = {
  id: string;
  label: string;
  street: string;
  cityLine: string;
  phones: { display: string; tel: string }[];
};

export const officeLocations: OfficeLocation[] = [
  {
    id: "virginia-beach",
    label: "Virginia Beach",
    street: "3972 Holland Road",
    cityLine: "Virginia Beach, VA 23452",
    phones: [
      { display: "757-431-8624", tel: "+17574318624" },
      { display: "757-513-6369", tel: "+17575136369" },
    ],
  },
  {
    id: "las-vegas",
    label: "Las Vegas",
    street: "1420 E. Charleston Blvd",
    cityLine: "Las Vegas, NV 89104",
    phones: [{ display: "702-732-8624", tel: "+17027328624" }],
  },
];
