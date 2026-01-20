export enum Sport {
  FOOTBALL = 'football',
  VOLLEYBALL = 'volleyball',
  BASKETBALL = 'basketball',
}
export enum MatchStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export enum TournamentStatus {
  REGISTRATION = 'registration',
  ONGOING = 'ongoing',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

export enum SystemRoles {
  ADMIN = 'admin',
  USER = 'user',
}

export enum FootballPosition {
  GOALKEEPER = 'goalkeeper',
  CENTER_BACK = 'center_back',
  RIGHT_BACK = 'right_back',
  LEFT_BACK = 'left_back',
  DEFENSIVE_MIDFIELDER = 'defensive_midfielder',
  CENTRAL_MIDFIELDER = 'central_midfielder',
  ATTACKING_MIDFIELDER = 'attacking_midfielder',
  RIGHT_WINGER = 'right_winger',
  LEFT_WINGER = 'left_winger',
  STRIKER = 'striker',
}

export enum BasketballPosition {
  POINT_GUARD = 'point_guard',
  SHOOTING_GUARD = 'shooting_guard',
  SMALL_FORWARD = 'small_forward',
  POWER_FORWARD = 'power_forward',
  CENTER = 'center',
}

export enum VolleyballPosition {
  SETTER = 'setter',
  OUTSIDE_HITTER = 'outside_hitter',
  OPPOSITE_HITTER = 'opposite_hitter',
  MIDDLE_BLOCKER = 'middle_blocker',
  LIBERO = 'libero',
  DEFENSIVE_SPECIALIST = 'defensive_specialist',
}

export enum SportPosition {
  // Football
  GOALKEEPER = 'goalkeeper',
  CENTER_BACK = 'center_back',
  RIGHT_BACK = 'right_back',
  LEFT_BACK = 'left_back',
  DEFENSIVE_MIDFIELDER = 'defensive_midfielder',
  CENTRAL_MIDFIELDER = 'central_midfielder',
  ATTACKING_MIDFIELDER = 'attacking_midfielder',
  RIGHT_WINGER = 'right_winger',
  LEFT_WINGER = 'left_winger',
  STRIKER = 'striker',

  // Basketball
  POINT_GUARD = 'point_guard',
  SHOOTING_GUARD = 'shooting_guard',
  SMALL_FORWARD = 'small_forward',
  POWER_FORWARD = 'power_forward',
  CENTER = 'center',

  // Volleyball
  SETTER = 'setter',
  OUTSIDE_HITTER = 'outside_hitter',
  OPPOSITE_HITTER = 'opposite_hitter',
  MIDDLE_BLOCKER = 'middle_blocker',
  LIBERO = 'libero',
  DEFENSIVE_SPECIALIST = 'defensive_specialist',

  DEFAULT = 'Default',
}

export function getMaxRosterSize(sport: Sport): number {
  const sizes: Record<Sport, number> = {
    [Sport.FOOTBALL]: 22, // 11 field + substitutes
    [Sport.BASKETBALL]: 15, // 5 court + bench
    [Sport.VOLLEYBALL]: 14, // 6 court + liberos/subs
  };
  return sizes[sport] || 20; // Default fallback
}

export function getPointsConfig(sport: Sport): { win: number; draw: number } {
  const config: Record<Sport, { win: number; draw: number }> = {
    [Sport.FOOTBALL]: { win: 3, draw: 1 },
    [Sport.BASKETBALL]: { win: 2, draw: 0 }, // No draws, but 0 for consistency
    [Sport.VOLLEYBALL]: { win: 3, draw: 0 }, // Simplified: win/loss only (common in many leagues)
  };
  return config[sport] || { win: 3, draw: 1 }; // Football default
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function calculateDurationHours(
  startTime: string,
  endTime: string,
): number {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  return (endMinutes - startMinutes) / 60;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
