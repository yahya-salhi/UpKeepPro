import axios from "axios";

// ** Helper function for error handling **
const handleRequest = async (callback) => {
  try {
    const { data } = await callback();
    return data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error; // Re-throw for UI handling
  }
};

// ======================
// ** Reference Data API **
// ======================

// ** Responsibles **
export const fetchResponsibles = async () =>
  handleRequest(() => axios.get("/api/responsibles"));

export const addResponsible = async (responsibleData) =>
  handleRequest(() => axios.post("/api/responsibles", responsibleData));

// ** Locations **
export const fetchLocations = async () =>
  handleRequest(() => axios.get("/api/locations"));

export const addLocation = async (locationData) =>
  handleRequest(() => axios.post("/api/locations", locationData));

// ** Placements **
export const fetchPlacements = async () =>
  handleRequest(() => axios.get("/api/placements"));

export const addPlacement = async (placementData) =>
  handleRequest(() => axios.post("/api/placements", placementData));

// ======================
// ** Tooling API **
// ======================

// ** Path 1: Tooling Acquisition (PV or M11) **
export const acquireTooling = async (toolingData) =>
  handleRequest(() => axios.post("/api/tooling/acquire", toolingData));

// PV to M11 Conversion
export const convertPVtoM11 = async (id, conversionData) =>
  handleRequest(() => axios.post(`/api/tooling/${id}/convert`, conversionData));

// ** Path 2: Tooling Exit (M11 only) **
export const exitTooling = async (id, exitData) =>
  handleRequest(() => axios.post(`/api/tooling/${id}/exit`, exitData));

// ** Path 3: Tooling Tracking **
export const fetchAllTooling = async (filters = {}) =>
  handleRequest(() => axios.get("/api/tooling", { params: filters }));

export const fetchToolingById = async (id) =>
  handleRequest(() => axios.get(`/api/tooling/${id}`));

export const fetchToolStock = async (id) =>
  handleRequest(() => axios.get(`/api/tooling/${id}/stock`));

export const fetchToolHistory = async (id) =>
  handleRequest(() => axios.get(`/api/tooling/${id}/history`));

export const fetchToolsByDirection = async (direction) =>
  handleRequest(() => axios.get(`/api/tooling/direction/${direction}`));

export const fetchToolsByType = async (type) =>
  handleRequest(() => axios.get(`/api/tooling/type/${type}`));

// ** Tooling Management **
export const updateTooling = async (id, toolingData) =>
  handleRequest(() => axios.put(`/api/tooling/${id}`, toolingData));

export const deleteTooling = async (id) =>
  handleRequest(() => axios.delete(`/api/tooling/${id}`));

export const deleteToolHistoryEntry = async (toolId, entryId) =>
  handleRequest(() =>
    axios.delete(`/api/tooling/${toolId}/history/${entryId}`)
  );

// ======================
// ** Utility Functions **
// ======================

// Generate MAT preview (for UI forms)
export const generateMatPreview = (designation, tools = []) => {
  if (!designation || designation.length < 2) return "";

  const prefix = designation.substring(0, 2).toUpperCase();

  // Find all tools with MAT starting with this prefix
  const similarTools = tools
    .filter((tool) => tool.mat && tool.mat.startsWith(prefix))
    .sort();

  // Get the highest existing number
  const highestNumber = similarTools.reduce((max, tool) => {
    const num = parseInt(tool.mat.replace(prefix, "")) || 0;
    return num > max ? num : max;
  }, 0);

  // Format the next number with leading zeros
  const nextNumber = (highestNumber + 1).toString().padStart(3, "0");

  return `${prefix}${nextNumber}`;
};

// Validate exit quantity (client-side pre-check)
export const validateExitQuantity = (currentQte, exitQte) => {
  return exitQte > 0 && exitQte <= currentQte;
};
