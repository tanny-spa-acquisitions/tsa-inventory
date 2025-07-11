import { BACKEND_URL } from "../config";

export async function fetchInventory() {
  const res = await fetch(`${BACKEND_URL}/google/inventory`);
  return res.json();
}

export async function updateInventoryRow(rowIndex: any, rowData: any) {
  const res = await fetch(`${BACKEND_URL}/google/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rowIndex, rowData }),
  });
  return res.json();
}