import {
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import { DataTable } from "@/components/ui/data-table";
import { apiClient } from "@/lib/api-client";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { ButtonConfig } from "@/components/ui/data-table-toolbar";

interface ServerDataTableProps<TData, TValue> {
  endpoint: string;
  columns: ColumnDef<TData, TValue>[];
  actions?: ButtonConfig<TData>[];
  dataPath?: string; // Key to find data in response (e.g., "users")
  searchPlaceholder?: string;
}

export interface ServerDataTableRef {
  refresh: () => void;
}

export const ServerDataTable = forwardRef<
  ServerDataTableRef,
  ServerDataTableProps<any, any>
>(
  (
    { endpoint, columns, actions, dataPath = "data", searchPlaceholder },
    ref
  ) => {
    // State
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Search & Pagination
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

    // Debounce search
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearch(search);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }, 500);
      return () => clearTimeout(timer);
    }, [search]);

    // Data Fetching
    const isFetchingRef = useRef(false);

    const fetchData = useCallback(async () => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsLoading(true);

      try {
        const page = pagination.pageIndex + 1;
        const limit = pagination.pageSize;
        const query = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (debouncedSearch) query.append("search", debouncedSearch);

        const response = await apiClient.get(`${endpoint}?${query.toString()}`);
        const result = await response.json();

        // Extract data based on path (e.g. "users" or "data")
        const list = result[dataPath] || [];
        setData(list);

        // Handle meta
        if (result.meta) {
          setTotalCount(result.meta.total);
          setTotalPages(result.meta.totalPages);
        }
      } catch (error) {
        console.error("ServerDataTable fetch error:", error);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    }, [
      endpoint,
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearch,
      dataPath,
    ]);

    // Triggers
    useEffect(() => {
      fetchData();
    }, [fetchData]);

    // Expose refresh
    useImperativeHandle(ref, () => ({
      refresh: () => {
        // Reset fetching ref to ensure it runs even if stuck?
        // Or just call fetchData again.
        // If we just call fetchData, it might be blocked by isFetchingRef if called too fast?
        // But usually manual refresh is distinct.
        isFetchingRef.current = false;
        fetchData();
      },
    }));

    return (
      <DataTable
        columns={columns}
        data={data}
        enableSearch
        searchPlaceholder={searchPlaceholder}
        onSearch={setSearch}
        manualFiltering
        isLoading={isLoading}
        actions={actions}
        manualPagination
        pageCount={totalPages}
        totalCount={totalCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    );
  }
);

ServerDataTable.displayName = "ServerDataTable";
