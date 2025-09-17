import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getCurrentUserId } from "./authUtils";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const userId = getCurrentUserId();
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  if (userId) {
    headers['x-user-id'] = userId;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let url = queryKey[0] as string;
    
    // Handle query parameters if present
    if (queryKey.length > 1 && typeof queryKey[1] === 'object') {
      const params = new URLSearchParams(queryKey[1] as Record<string, string>);
      url += `?${params.toString()}`;
    } else if (queryKey.length > 1) {
      // For simple paths like ["/api/songs", "123"] or ["/api/profile", userId]
      url = queryKey.join("/");
    }
    
    const userId = getCurrentUserId();
    const headers: Record<string, string> = {};
    
    if (userId) {
      headers['x-user-id'] = userId;
    }

    const res = await fetch(url, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
