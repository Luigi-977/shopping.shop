// Countries Reboot Market delivers to, each with its first-level regions
// (counties/regions). Town/area is typed by the customer, since listing every
// town would be impossible to keep accurate — this gives precise location
// (country + region + typed town + landmark) without a broken village tree.

export type Country = {
  code: string;
  name: string;
  regions: string[];
};

export const COUNTRIES: Country[] = [
  {
    code: "KE",
    name: "Kenya",
    regions: [
      "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu",
      "Garissa", "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho",
      "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale",
      "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit",
      "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru", "Nandi",
      "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya",
      "Taita-Taveta", "Tana River", "Tharaka-Nithi", "Trans Nzoia", "Turkana",
      "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
    ],
  },
  {
    code: "TZ",
    name: "Tanzania",
    regions: [
      "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera",
      "Katavi", "Kigoma", "Kilimanjaro", "Lindi", "Manyara", "Mara", "Mbeya",
      "Morogoro", "Mtwara", "Mwanza", "Njombe", "Pwani", "Rukwa", "Ruvuma",
      "Shinyanga", "Simiyu", "Singida", "Songwe", "Tabora", "Tanga",
      "Zanzibar",
    ],
  },
  {
    code: "UG",
    name: "Uganda",
    regions: ["Central", "Eastern", "Northern", "Western", "Kampala"],
  },
  {
    code: "RW",
    name: "Rwanda",
    regions: ["Kigali", "Eastern", "Northern", "Southern", "Western"],
  },
  {
    code: "BI",
    name: "Burundi",
    regions: ["Bujumbura", "Gitega", "Ngozi", "Rumonge", "Other"],
  },
  {
    code: "SS",
    name: "South Sudan",
    regions: ["Central Equatoria", "Eastern Equatoria", "Jonglei", "Other"],
  },
  {
    code: "ET",
    name: "Ethiopia",
    regions: ["Addis Ababa", "Oromia", "Amhara", "Tigray", "Other"],
  },
];

export function regionsFor(countryCode: string): string[] {
  return COUNTRIES.find((c) => c.code === countryCode)?.regions ?? [];
}

export function countryName(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? code;
}
