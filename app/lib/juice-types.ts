// Смаки соку — один список для всієї адмінки. Код (value) той самий, що в
// застосунку й app-server (ProductJuiceType); новий смак додається тут, у
// застосунку (lib/config/enum.dart) і в enum_declare.js app-server.
export const JUICE_TYPES = [
  { value: 'APPLE', label: 'Яблучний' },
  { value: 'APPLEGRAPE', label: 'Яблучно-виноградний' },
  { value: 'CARROTAPPLE', label: 'Яблучно-морквяний' },
  { value: 'PEARAPPLE', label: 'Яблучно-грушевий' },
  { value: 'STRAWBERRYAPPLE', label: 'Яблучно-полуничний' },
  { value: 'APPLEGINGER', label: 'Яблучно-імбирний' },
  { value: 'APPLELEMON', label: 'Яблучно-лимонний' },
  { value: 'APPLEBERRY', label: 'Фруктово-ягідний' },
] as const;

export const JUICE_LABELS: Record<string, string> = Object.fromEntries(
  JUICE_TYPES.map(({ value, label }) => [value, label]),
);
