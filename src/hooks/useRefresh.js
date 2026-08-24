import { useCallback, useState } from "react";
import haptics from "../lib/haptics";

export function useRefresh(loader) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    haptics.light();
    try {
      await loader();
    } catch (error) {
      console.warn("Refresh failed", error);
    } finally {
      setRefreshing(false);
    }
  }, [loader, refreshing]);

  return { refreshing, onRefresh };
}

export default useRefresh;
