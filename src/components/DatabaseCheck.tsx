import { useEffect, useState } from "react";
import {
  checkDatabaseTables,
  DatabaseCheckResult,
  TableCheckResult,
} from "../utils/checkDatabase";

export function DatabaseCheck() {
  const [results, setResults] = useState<DatabaseCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkTables() {
      try {
        const tableResults = await checkDatabaseTables();
        setResults(tableResults);
      } catch (err) {
        console.error("Error checking database:", err);
        setError("Failed to check database tables");
      } finally {
        setLoading(false);
      }
    }

    checkTables();
  }, []);

  if (loading) {
    return <div>Checking database tables...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!results) {
    return <div>No results</div>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Database Tables Check</h2>
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Table</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Error</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(results).map(
            ([table, result]: [string, TableCheckResult]) => (
              <tr key={table} className="border-t">
                <td className="px-4 py-2">{table}</td>
                <td className="px-4 py-2">
                  {result.exists ? (
                    <span className="text-green-500">Exists</span>
                  ) : (
                    <span className="text-red-500">Missing</span>
                  )}
                </td>
                <td className="px-4 py-2 text-red-500">
                  {result.error ? result.error.message : ""}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
