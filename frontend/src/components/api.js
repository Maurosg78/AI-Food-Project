import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

export const verifyIngredients = async (ingredients) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/verify`, { ingredients });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
