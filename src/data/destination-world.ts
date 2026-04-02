/**
 * Geographic hierarchy for /destinations: continents → countries → subdivisions.
 * RSS posts are matched via {@link Country.matchTerms} and each subdivision’s {@link Subdivision.matchTerms}.
 *
 * Add rows here as you retire old “flat” location pages—matchTerms should include names
 * visitors (and your feed titles) actually use, including aliases.
 */

export type Subdivision = {
  slug: string;
  name: string;
  /** Phrases to find in title / categories / snippet (case-insensitive). */
  matchTerms: string[];
};

export type Country = {
  slug: string;
  name: string;
  continentId: string;
  matchTerms: string[];
  subdivisions: Subdivision[];
};

export type Continent = {
  id: string;
  name: string;
  /** Sort order when grouping by continent (lower = earlier). */
  sortOrder: number;
};

export const CONTINENTS: Continent[] = [
  { id: "africa", name: "Africa", sortOrder: 40 },
  { id: "asia", name: "Asia", sortOrder: 50 },
  { id: "caribbean", name: "Caribbean", sortOrder: 20 },
  { id: "europe", name: "Europe", sortOrder: 30 },
  { id: "middle-east", name: "Middle East", sortOrder: 55 },
  { id: "north-america", name: "North America", sortOrder: 10 },
  { id: "oceania", name: "Oceania", sortOrder: 60 },
  { id: "south-america", name: "South America", sortOrder: 70 },
];

/** Starter set—expand to mirror your legacy ~92 pages. */
export const COUNTRIES: Country[] = [
  {
    slug: "united-states",
    name: "United States",
    continentId: "north-america",
    matchTerms: ["united states", "u.s.", "usa", "u.s.a.", "america"],
    subdivisions: [
      {
        slug: "alaska",
        name: "Alaska",
        matchTerms: ["alaska", "alaskan", "denali", "juneau"],
      },
      {
        slug: "california",
        name: "California",
        matchTerms: ["california", "los angeles", "san francisco", "napa"],
      },
      {
        slug: "florida",
        name: "Florida",
        matchTerms: ["florida", "miami", "orlando", "everglades"],
      },
      {
        slug: "hawaii",
        name: "Hawaii",
        matchTerms: [
          "hawaii",
          "hawaiian",
          "oahu",
          "maui",
          "kauai",
          "big island",
          "honolulu",
          "waikiki",
        ],
      },
      {
        slug: "new-york",
        name: "New York",
        matchTerms: ["new york", "nyc", "manhattan"],
      },
    ],
  },
  {
    slug: "canada",
    name: "Canada",
    continentId: "north-america",
    matchTerms: ["canada", "canadian"],
    subdivisions: [
      {
        slug: "british-columbia",
        name: "British Columbia",
        matchTerms: ["british columbia", "vancouver", "whistler"],
      },
      {
        slug: "alberta",
        name: "Alberta",
        matchTerms: ["alberta", "banff", "calgary"],
      },
      {
        slug: "quebec",
        name: "Quebec",
        matchTerms: ["quebec", "québec", "montreal", "montéal", "quebec city"],
      },
    ],
  },
  {
    slug: "mexico",
    name: "Mexico",
    continentId: "north-america",
    matchTerms: ["mexico", "méxico", "mexican"],
    subdivisions: [
      {
        slug: "riviera-maya",
        name: "Riviera Maya",
        matchTerms: ["riviera maya", "cancún", "cancun", "tulum", "playa del carmen"],
      },
      {
        slug: "mexico-city",
        name: "Mexico City",
        matchTerms: ["mexico city", "ciudad de méxico"],
      },
      {
        slug: "los-cabos",
        name: "Los Cabos",
        matchTerms: ["los cabos", "cabo san lucas", "san josé del cabo"],
      },
    ],
  },
  {
    slug: "costa-rica",
    name: "Costa Rica",
    continentId: "north-america",
    matchTerms: ["costa rica"],
    subdivisions: [
      {
        slug: "guanacaste",
        name: "Guanacaste",
        matchTerms: ["guanacaste", "liberia"],
      },
      {
        slug: "monteverde",
        name: "Monteverde & Arenal",
        matchTerms: ["monteverde", "arenal", "la fortuna"],
      },
    ],
  },
  {
    slug: "bahamas",
    name: "Bahamas",
    continentId: "caribbean",
    matchTerms: ["bahamas", "bahamian", "nassau"],
    subdivisions: [
      {
        slug: "nassau-paradise-island",
        name: "Nassau & Paradise Island",
        matchTerms: ["nassau", "paradise island", "atlantis"],
      },
      {
        slug: "exuma",
        name: "Exuma",
        matchTerms: ["exuma", "exumas"],
      },
    ],
  },
  {
    slug: "jamaica",
    name: "Jamaica",
    continentId: "caribbean",
    matchTerms: ["jamaica", "jamaican"],
    subdivisions: [
      {
        slug: "montego-bay",
        name: "Montego Bay",
        matchTerms: ["montego bay", "mobay"],
      },
      {
        slug: "ochos-rios",
        name: "Ocho Rios",
        matchTerms: ["ocho rios"],
      },
    ],
  },
  {
    slug: "dominican-republic",
    name: "Dominican Republic",
    continentId: "caribbean",
    matchTerms: ["dominican republic", "punta cana", "santo domingo"],
    subdivisions: [
      {
        slug: "punta-cana",
        name: "Punta Cana",
        matchTerms: ["punta cana", "bávaro", "bavaro"],
      },
      {
        slug: "la-romana",
        name: "La Romana",
        matchTerms: ["la romana", "bayahíbe"],
      },
    ],
  },
  {
    slug: "puerto-rico",
    name: "Puerto Rico",
    continentId: "caribbean",
    matchTerms: ["puerto rico", "boricua", "san juan"],
    subdivisions: [
      {
        slug: "san-juan",
        name: "San Juan",
        matchTerms: ["san juan", "old san juan"],
      },
      {
        slug: "vieques-culebra",
        name: "Vieques & Culebra",
        matchTerms: ["vieques", "culebra"],
      },
    ],
  },
  {
    slug: "france",
    name: "France",
    continentId: "europe",
    matchTerms: ["france", "french"],
    subdivisions: [
      {
        slug: "paris",
        name: "Paris",
        matchTerms: ["paris"],
      },
      {
        slug: "provence",
        name: "Provence",
        matchTerms: ["provence", "nice", "côte d'azur", "cote d'azur"],
      },
    ],
  },
  {
    slug: "italy",
    name: "Italy",
    continentId: "europe",
    matchTerms: ["italy", "italian", "itàlia"],
    subdivisions: [
      {
        slug: "rome",
        name: "Rome & Lazio",
        matchTerms: ["rome", "roma", "lazio"],
      },
      {
        slug: "tuscany",
        name: "Tuscany",
        matchTerms: ["tuscany", "toscana", "florence", "firenze"],
      },
      {
        slug: "sicily",
        name: "Sicily",
        matchTerms: ["sicily", "sicilia", "palermo"],
      },
    ],
  },
  {
    slug: "spain",
    name: "Spain",
    continentId: "europe",
    matchTerms: ["spain", "spanish", "españa", "espana"],
    subdivisions: [
      {
        slug: "barcelona",
        name: "Barcelona",
        matchTerms: ["barcelona", "catalonia", "catalunya"],
      },
      {
        slug: "madrid",
        name: "Madrid",
        matchTerms: ["madrid"],
      },
    ],
  },
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    continentId: "europe",
    matchTerms: ["united kingdom", "uk", "britain", "great britain", "england", "scotland", "wales"],
    subdivisions: [
      {
        slug: "london",
        name: "London",
        matchTerms: ["london"],
      },
      {
        slug: "edinburgh",
        name: "Edinburgh & Highlands",
        matchTerms: ["edinburgh", "highlands", "scottish"],
      },
    ],
  },
  {
    slug: "greece",
    name: "Greece",
    continentId: "europe",
    matchTerms: ["greece", "greek"],
    subdivisions: [
      {
        slug: "athens",
        name: "Athens",
        matchTerms: ["athens", "athenian"],
      },
      {
        slug: "santorini-mykonos",
        name: "Santorini & Cyclades",
        matchTerms: ["santorini", "mykonos", "cyclades"],
      },
    ],
  },
  {
    slug: "japan",
    name: "Japan",
    continentId: "asia",
    matchTerms: ["japan", "japanese"],
    subdivisions: [
      {
        slug: "tokyo",
        name: "Tokyo",
        matchTerms: ["tokyo"],
      },
      {
        slug: "kyoto",
        name: "Kyoto",
        matchTerms: ["kyoto"],
      },
    ],
  },
  {
    slug: "thailand",
    name: "Thailand",
    continentId: "asia",
    matchTerms: ["thailand", "thai"],
    subdivisions: [
      {
        slug: "bangkok",
        name: "Bangkok",
        matchTerms: ["bangkok"],
      },
      {
        slug: "phuket",
        name: "Phuket & Islands",
        matchTerms: ["phuket", "krabi", "koh samui"],
      },
    ],
  },
  {
    slug: "australia",
    name: "Australia",
    continentId: "oceania",
    matchTerms: ["australia", "australian"],
    subdivisions: [
      {
        slug: "sydney",
        name: "Sydney & NSW",
        matchTerms: ["sydney", "new south wales"],
      },
      {
        slug: "great-barrier-reef",
        name: "Great Barrier Reef",
        matchTerms: ["great barrier reef", "cairns", "whitsundays"],
      },
    ],
  },
  {
    slug: "new-zealand",
    name: "New Zealand",
    continentId: "oceania",
    matchTerms: ["new zealand", "aotearoa", "kiwi"],
    subdivisions: [
      {
        slug: "south-island",
        name: "South Island",
        matchTerms: ["south island", "queenstown", "milford"],
      },
      {
        slug: "north-island",
        name: "North Island",
        matchTerms: ["north island", "auckland", "rotorua"],
      },
    ],
  },
  {
    slug: "united-arab-emirates",
    name: "United Arab Emirates",
    continentId: "middle-east",
    matchTerms: ["uae", "emirates", "dubai", "abu dhabi"],
    subdivisions: [
      {
        slug: "dubai",
        name: "Dubai",
        matchTerms: ["dubai"],
      },
      {
        slug: "abu-dhabi",
        name: "Abu Dhabi",
        matchTerms: ["abu dhabi"],
      },
    ],
  },
  {
    slug: "egypt",
    name: "Egypt",
    continentId: "africa",
    matchTerms: ["egypt", "egyptian"],
    subdivisions: [
      {
        slug: "cairo-luxor",
        name: "Cairo & Nile",
        matchTerms: ["cairo", "luxor", "nile"],
      },
      {
        slug: "red-sea",
        name: "Red Sea",
        matchTerms: ["hurghada", "sharm", "red sea"],
      },
    ],
  },
  {
    slug: "south-africa",
    name: "South Africa",
    continentId: "africa",
    matchTerms: ["south africa", "cape town"],
    subdivisions: [
      {
        slug: "cape-town",
        name: "Cape Town & Winelands",
        matchTerms: ["cape town", "stellenbosch", "winelands"],
      },
      {
        slug: "safari-kruger",
        name: "Safari & Kruger",
        matchTerms: ["kruger", "safari"],
      },
    ],
  },
  {
    slug: "peru",
    name: "Peru",
    continentId: "south-america",
    matchTerms: ["peru", "peruvian"],
    subdivisions: [
      {
        slug: "cusco-machu-picchu",
        name: "Cusco & Machu Picchu",
        matchTerms: ["cusco", "cuzco", "machu picchu", "sacred valley"],
      },
      {
        slug: "lima",
        name: "Lima",
        matchTerms: ["lima"],
      },
    ],
  },
];

const continentById = new Map(CONTINENTS.map((c) => [c.id, c]));
const countryBySlug = new Map(COUNTRIES.map((c) => [c.slug, c]));

export function getContinentById(id: string): Continent | undefined {
  return continentById.get(id);
}

export function getCountryBySlug(slug: string): Country | undefined {
  return countryBySlug.get(slug);
}

export function getSubdivision(
  countrySlug: string,
  subdivisionSlug: string,
): { country: Country; subdivision: Subdivision } | undefined {
  const country = countryBySlug.get(countrySlug);
  if (!country) return undefined;
  const subdivision = country.subdivisions.find((s) => s.slug === subdivisionSlug);
  if (!subdivision) return undefined;
  return { country, subdivision };
}
