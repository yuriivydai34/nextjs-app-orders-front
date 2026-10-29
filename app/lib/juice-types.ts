// Смаки соку — один список для всієї адмінки. Код (value) той самий, що в
// застосунку й app-server (ProductJuiceType); новий смак додається тут, у
// застосунку (lib/config/enum.dart) і в enum_declare.js app-server.
export const JUICE_TYPES = [
  { value: 'APPLE', label: 'Яблучний' },
  { value: 'APPLEGRAPE', label: 'Яблуко-виноград' },
  { value: 'CARROTAPPLE', label: 'Яблуко-морква' },
  { value: 'PEARAPPLE', label: 'Яблуко-груша' },
  { value: 'STRAWBERRYAPPLE', label: 'Яблуко-полуниця' },
  { value: 'APPLEGINGER', label: 'Яблуко-імбир' },
  { value: 'APPLELEMON', label: 'Яблуко-лимон' },
  { value: 'APPLEBERRY', label: 'Фруктово-ягідний' },
] as const;

export const JUICE_LABELS: Record<string, string> = Object.fromEntries(
  JUICE_TYPES.map(({ value, label }) => [value, label]),
);
