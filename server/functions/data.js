import crypto from "crypto"
import { DateTime } from "luxon";

export const generateId = (length) => {
  return crypto.randomBytes(length).toString("hex");
};

export function formatTimeStamp(input) {
  const totalSeconds = Math.floor(input); // ignore decimal part

  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return `${hours}:${paddedMinutes}:${paddedSeconds}`
}

export function formatDateToMySQL(dateInput) {
  const date = DateTime.fromJSDate(new Date(dateInput), {
    zone: "America/New_York",
  });
  return date.toFormat("yyyy-LL-dd HH:mm:ss");  
}

export const extractJsonArray = (input) => {
  const regex = /\[\s*{[\s\S]*?}\s*]/g; // matches from [ { ... } ] with any content between

  const match = input.match(regex);

  if (match && match.length > 0) {
    try {
      const parsed = match[0];
      return parsed;
    } catch (e) {
      // If parsing fails, return original input
      return input;
    }
  }

  // If no match is found, return original input
  return input;
};

export function ensureValidJsonString(input) {
  try {
    const parsed = typeof input === 'string' ? JSON.parse(input) : input;
    return JSON.stringify(parsed);
  } catch (err) {
    throw new Error('Invalid JSON input');
  }
}