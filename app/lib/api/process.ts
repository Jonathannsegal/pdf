const API_BASE = "http://localhost:3001/api";

export async function processPDF(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/process/pdf`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to process PDF");
  }

  const result = await response.json();
  if (result.error) {
    throw new Error(result.error);
  }

  return result;
}

export async function processPDFWithPrompt(file: File, prompt: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("prompt", prompt);

  const response = await fetch(`${API_BASE}/process/pdf-with-prompt`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to process PDF with custom prompt");
  }

  const result = await response.json();
  if (result.error) {
    throw new Error(result.error);
  }

  return result;
}