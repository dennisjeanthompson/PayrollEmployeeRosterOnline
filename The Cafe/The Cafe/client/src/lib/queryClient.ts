import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { apiUrl } from "./api";

async function throwIfResNotOk(res: Response, skipBodyCheck: boolean = false) {
  if (!res.ok) {
    // Only consume the body for error responses
    const contentType = res.headers.get('content-type');
    let errorData;
    
    try {
      errorData = contentType?.includes('application/json') 
        ? await res.json() 
        : await res.text();
    } catch (e) {
      errorData = res.statusText;
    }
    
    const error = new Error(
      typeof errorData === 'object' 
        ? errorData.message || errorData.error || 'An error occurred'
        : errorData || res.statusText
    );
    
    (error as any).status = res.status;
    (error as any).data = errorData;
    throw error;
  }
  // Don't consume the body for successful responses - let the caller handle it
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };

  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(apiUrl(url), {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });

    // For non-ok responses, throw an error
    if (!res.ok) {
      await throwIfResNotOk(res);
    }
    return res;
  } catch (error) {
    console.error('API Request failed:', {
      url,
      method,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * API request for binary responses (PDF, images, etc.)
 * Returns the blob directly without consuming the response body
 */
export async function apiBlobRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Blob> {
  const headers: Record<string, string> = {
    'Accept': 'application/pdf, application/octet-stream, */*'
  };

  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  console.log('[apiBlobRequest] Making request:', { method, url, hasData: !!data });

  try {
    const res = await fetch(apiUrl(url), {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });

    console.log('[apiBlobRequest] Response status:', res.status, res.statusText);

    if (!res.ok) {
      // Try to get error message from response
      const contentType = res.headers.get('content-type');
      let errorMessage = 'Request failed';
      
      try {
        if (contentType?.includes('application/json')) {
          const errorData = await res.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } else {
          errorMessage = await res.text() || errorMessage;
        }
      } catch (e) {
        errorMessage = res.statusText || errorMessage;
      }
      
      console.error('[apiBlobRequest] Error:', errorMessage);
      throw new Error(errorMessage);
    }

    const blob = await res.blob();
    console.log('[apiBlobRequest] Success, blob size:', blob.size, 'type:', blob.type);
    return blob;
  } catch (error) {
    console.error('Blob API Request failed:', {
      url,
      method,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(apiUrl(queryKey.join("/") as string), {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);

    // Check if response is JSON before parsing
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    } else {
      // If not JSON, try to parse anyway but handle errors
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse response as JSON:', text.substring(0, 100));
        throw new Error('Server returned non-JSON response');
      }
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      gcTime: 30 * 60 * 1000,
      refetchOnMount: true,
    },
    mutations: {
      retry: false,
    },
  },
});

export const invalidateQueries = {
  payroll: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/payroll'] });
    queryClient.invalidateQueries({ queryKey: ['/api/payroll/periods'] });
    queryClient.invalidateQueries({ queryKey: ['/api/payroll/entries'] });
  },
  shifts: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
    queryClient.invalidateQueries({ queryKey: ['/api/shifts/branch'] });
  },
  employees: () => {
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
    queryClient.invalidateQueries({ queryKey: ['/api/employees/stats'] });
    queryClient.invalidateQueries({ queryKey: ['/api/hours/all-employees'] });
  },
  notifications: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  },
  timeOff: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/time-off-requests'] });
    queryClient.invalidateQueries({ queryKey: ['/api/approvals'] });
  },
  branchSwitch: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
    queryClient.invalidateQueries({ queryKey: ['/api/shifts/branch'] });
    queryClient.invalidateQueries({ queryKey: ['branches'] });
    queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['/api/deduction-settings'] });
    queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
    queryClient.invalidateQueries({ queryKey: ['analytics-trends'] });
    queryClient.invalidateQueries({ queryKey: ['forecast-labor'] });
    queryClient.invalidateQueries({ queryKey: ['forecast-payroll'] });
    queryClient.invalidateQueries({ queryKey: ['/api/adjustment-logs/branch'] });
    queryClient.invalidateQueries({ queryKey: ['adjustment-logs-branch'] });
    queryClient.invalidateQueries({ queryKey: ['/api/exception-logs'] });
    queryClient.invalidateQueries({ queryKey: ['/api/loans/branch'] });
    queryClient.invalidateQueries({ queryKey: ['leave-credits'] });
  },
  all: () => {
    queryClient.invalidateQueries();
  },
};
