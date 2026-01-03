// Predefined campus locations with pixel coordinates relative to the campus map image
// Coordinates are based on the AMBO University Weliso Campus map image
// These will need calibration after the actual map image is placed

export const CAMPUS_LOCATIONS = [
  { id: 'cafe', name: 'Café', x: 280, y: 420 },
  { id: 'library', name: 'Library', x: 350, y: 180 },
  { id: 'clinic', name: 'Clinic', x: 420, y: 350 },
  { id: 'male_dorm_1', name: 'Male Dormitory 1', x: 180, y: 380 },
  { id: 'male_dorm_2', name: 'Male Dormitory 2', x: 220, y: 380 },
  { id: 'female_dorm', name: 'Female Dormitory', x: 260, y: 380 },
  { id: 'registrar', name: 'Registrar', x: 380, y: 280 },
  { id: 'main_building', name: 'Main Building', x: 400, y: 150 },
  { id: 'launch', name: 'Launch Area', x: 320, y: 250 },
  { id: 'other', name: 'Other Location', x: 500, y: 300 },
];

// Helper function to get location by ID
export const getLocationById = (id) => {
  return CAMPUS_LOCATIONS.find(loc => loc.id === id);
};

// Helper function to get location name by ID
export const getLocationName = (id) => {
  const location = getLocationById(id);
  return location ? location.name : 'Unknown Location';
};

