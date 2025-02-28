import type { ApiError } from "@/app/types";

export function handleApiError(error: unknown, context: string): ApiError {
  console.error(`Error in ${context}:`, error);

  if (!window.navigator.onLine) {
    return {
      type: "connection",
      message:
        "No internet connection. Please check your network and try again.",
    };
  }

  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return {
      type: "connection",
      message:
        "Unable to connect to the server. Please ensure the server is running and try again.",
    };
  }

  return {
    type: "fetch",
    message: `An error occurred while ${context}. Please try again.`,
  };
}
