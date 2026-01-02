# Implementation Plan: Fix User Search Functionality

## Problem

The search functionality in the User Management table was not working. The search input in the UI was not connected to the API fetch logic, so typing in the search box had no effect on the data displayed.

## Solution

Enable server-side search by connecting the `DataTable`'s search input to the `UserTable`'s data fetching logic.

## Changes

### 1. `src/components/ui/data-table.tsx`

- Added `onSearch` prop to `DataTableProps` to allow monitoring search input changes from the parent component.
- Added `manualFiltering` prop to `DataTableProps` to allow disabling client-side filtering when server-side filtering is used.
- Updated `handleGlobalFilterChange` to call `onSearch` when the global filter changes.
- Passed `manualFiltering` to the `useReactTable` hook.

### 2. `src/modules/users/components/user-table.tsx`

- Added `search` local state to track the input value.
- Added `debouncedSearch` state to hold the debounced search term.
- Added a `useEffect` hook to:
  - Debounce the `search` state update (500ms delay).
  - Reset `pagination` to page 0 whenever the search term changes.
- Updated `fetchUsers` function to:
  - Include `debouncedSearch` in the `userService.getUsers` API call.
  - Add `debouncedSearch` to the dependency array and request key.
- Passed `onSearch={setSearch}` and `manualFiltering` to the `DataTable` component.

## Verification

- Typing in the "Search users..." box should now trigger an API call after a 500ms delay.
- The API call should include the `search` query parameter (e.g., `/api/users?page=1&limit=10&search=term`).
- Pagination should reset to the first page when a new search term is entered.
- The table should display the filtered results returned by the API.
