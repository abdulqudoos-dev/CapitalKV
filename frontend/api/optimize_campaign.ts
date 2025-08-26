import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const result = await axios.post(
        'https://backend.capitalkv.com/optimize_campaign',
        req.body
      );
      res.status(200).json(result.data);
    } catch (error) {
      res.status(500).json({ error: 'Optimization failed.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

/*const axiosInstance = axios.create({
  // baseURL: "http://localhost:8000",
  // baseURL: "http://127.0.0.1:8000",
  baseURL: "https://backend.capitalkv.com",
});

axiosInstance.interceptors.request.use(
  (config) => {
    // If you need to add a token for authorization, you can add it here
    // Example: config.headers['Authorization'] = `Bearer ${yourToken}`;

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        "Response error:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }

    return Promise.reject(error);
  }

  export default axiosInstance; */
