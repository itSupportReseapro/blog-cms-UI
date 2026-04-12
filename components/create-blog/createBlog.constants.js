export const DROPDOWN_FIELDS = {
  group: "group",
  category: "category",
  subcategory: "subcategory",
  country: "country",
  state: "state",
  district: "district",
  city: "city",
};

export const COUNTRY_ADD_FIELDS = [
  { name: "name", label: "Name", placeholder: "Country name" },
  { name: "regional_name", label: "Regional Name", placeholder: "Regional name" },
  { name: "country_code", label: "Country Code", placeholder: "+91" },
  { name: "code", label: "Code", placeholder: "IND" },
  { name: "phone_code", label: "Phone Code", placeholder: "91" },
];

export const DEPENDENT_DROPDOWNS = {
  group: ["category", "subcategory"],
  category: ["subcategory"],
  country: ["state", "district", "city"],
  state: ["district", "city"],
  district: ["city"],
};
