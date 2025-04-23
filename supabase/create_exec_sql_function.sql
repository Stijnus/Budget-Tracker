-- Create a function to execute SQL statements with admin privileges
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE sql;
  result := jsonb_build_object('success', true);
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  result := jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
