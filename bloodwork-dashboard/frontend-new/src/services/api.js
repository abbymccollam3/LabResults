const API_URL = 'http://localhost:8000';

export const fetchBloodwork = async (patientId) => {
  try {
    const response = await fetch(`${API_URL}/bloodwork/${patientId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching bloodwork:', error);
    throw error;
  }
}; 