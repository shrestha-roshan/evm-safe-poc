import { useEffect, useMemo } from "react";
import { fetchSafeAppFromManifest } from "../../services/safe-apps/manifest";
import { SafeAppAccessPolicyTypes } from "@safe-global/safe-gateway-typescript-sdk";
import useAsync from "../useAsync";
import type { SafeAppDataWithPermissions } from "../../types";

type UseSafeAppFromManifestReturnType = {
  safeApp?: SafeAppDataWithPermissions;
  isLoading: boolean;
};

const getEmptySafeApp = (url = ""): SafeAppDataWithPermissions => {
  return {
    id: Math.random(),
    url,
    name: "unknown",
    iconUrl: "/images/apps/apps-icon.svg",
    description: "",
    chainIds: [],
    accessControl: {
      type: SafeAppAccessPolicyTypes.NoRestrictions,
    },
    tags: [],
    safeAppsPermissions: [],
  };
};

const useSafeAppFromManifest = (
  appUrl: string,
  chainId: string
): UseSafeAppFromManifestReturnType => {
  const [data, error, isLoading] = useAsync<SafeAppDataWithPermissions>(() => {
    if (appUrl && chainId) return fetchSafeAppFromManifest(appUrl, chainId);
  }, [appUrl, chainId]);

  const emptyApp = useMemo(() => getEmptySafeApp(appUrl), [appUrl]);

  useEffect(() => {
    if (!error) return;
    console.log(`${appUrl}, ${(error as Error).message}`);
  }, [appUrl, error]);

  return { safeApp: data || emptyApp, isLoading };
};

export { useSafeAppFromManifest };
