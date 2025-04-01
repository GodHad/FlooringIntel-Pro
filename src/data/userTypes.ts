export const userTypeOptions = [
  { value: "flooring_retailer", label: "Flooring Retailer" },
  { value: "flooring_dealer", label: "Flooring Dealer" },
  { value: "store_owner", label: "Flooring Store Owner" },
  { value: "ecommerce_owner", label: "Ecommerce Store Owner" },
  { value: "distributor", label: "Distributor" },
  { value: "manufacturer_brand", label: "Manufacturer / Brand" },
  { value: "interior_designer", label: "Interior Designer" },
  { value: "contractor_installer", label: "Contractor / Installer" },
  { value: "sales_representative", label: "Sales Representative" },
  { value: "other", label: "Other" },
];

export const isValidPhone = (value: string) => /^[+]?[\d\s().-]{7,}$/.test(value.trim());
