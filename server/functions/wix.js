import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const WIX_SITE_ID = process.env.WIX_SITE_ID;
const WIX_API_KEY = process.env.WIX_API_KEY;
const COLLECTION_ID = process.env.COLLECTION_ID;

async function addItemToWixCollection(title, description) {
  try {
    const response = await axios.post('https://tannyspaacquisitions.com/_functions/addTubsItem', {
      title,
      description
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error adding item:', error.response?.data || error.message);
  }
}

// Example usage
addItemToWixCollection('Test Title', 'This is a test description');

