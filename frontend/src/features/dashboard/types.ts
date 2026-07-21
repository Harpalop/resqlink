export interface DayCount {
  day: string
  count: number
}

export interface GroupCount {
  group: string
  count: number
}

export interface DashboardStats {
  profileCompletionPercent: number
  emergencyContacts: number
  myEmergencies: number
  myActiveEmergencies: number
  isDonor: boolean
  myDonations: number
  networkUsers: number
  availableDonors: number
  openBloodRequests: number
  emergenciesLast7Days: DayCount[]
  donorsByBloodGroup: GroupCount[]
}

/**
 * Chart series colors, validated with the dataviz palette validator
 * (lightness band, chroma, CVD separation, contrast) for both modes.
 */
export const CHART_COLORS = {
  light: { blue: '#2a78d6', green: '#008300', magenta: '#e87ba4', yellow: '#eda100' },
  dark: { blue: '#3987e5', green: '#008300', magenta: '#d55181', yellow: '#c98500' },
}
