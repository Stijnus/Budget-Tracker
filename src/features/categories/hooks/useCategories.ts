import { useState, useEffect } from "react";
import { supabase } from "@/api/supabase/client";

interface Category {
  id: string;
  name: string;
}

export const useCategories = () => {
  const [data, setData] = useState<Category[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: categories, error } = await supabase
          .from("categories")
          .select("id, name");

        if (error) throw error;
        setData(categories as Category[]);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch categories")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { data, error, loading };
};
