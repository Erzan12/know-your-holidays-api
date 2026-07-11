export interface HolidayResponse {
  countryCode: string;
  date: string;
  localName: string;
  name: string;
  county: string | null;
  global: boolean;
  launchYear: number | null;
  types: string[];
}

export interface OpenHolidaysSchoolResponse {
  id: string;
  startDate: string;
  endDate: string;
  name: Array<{ language: string; text: string }>;
  type: string;
}