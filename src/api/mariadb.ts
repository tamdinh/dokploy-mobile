import useSWR, { type SWRConfiguration } from 'swr';

import { getRequest, postRequest } from '@/lib/http';
import { useActiveOrganizationSWRKey } from '@/lib/organization-swr-key';
import type { MariadbOneResponse } from '@/types/mariadb';
import type {
  MariadbSaveEnvironmentRequest,
  MariadbSaveEnvironmentResponse,
} from '@/types/environment-actions';
import type {
  ServiceDeployResponse,
  ServiceRebuildResponse,
  ServiceReloadResponse,
  ServiceStartResponse,
  ServiceStopResponse,
} from '@/types/application-actions';

export function useMariadbOne(
  mariadbId: string | undefined,
  config?: SWRConfiguration<MariadbOneResponse>
) {
  const key = useActiveOrganizationSWRKey(mariadbId ? ['mariadb.one', mariadbId] : null);

  return useSWR<MariadbOneResponse>(key, () => getRequest('mariadb.one', { mariadbId }), config);
}

export function mariadbSaveEnvironment(payload: MariadbSaveEnvironmentRequest) {
  return postRequest<MariadbSaveEnvironmentResponse>('mariadb.saveEnvironment', payload);
}

export function mariadbDeploy(payload: { mariadbId: string }) {
  return postRequest<ServiceDeployResponse>('mariadb.deploy', payload);
}

export function mariadbReload(payload: { mariadbId: string; appName: string }) {
  return postRequest<ServiceReloadResponse>('mariadb.reload', payload);
}

export function mariadbRebuild(payload: { mariadbId: string }) {
  return postRequest<ServiceRebuildResponse>('mariadb.rebuild', payload);
}

export function mariadbStart(payload: { mariadbId: string }) {
  return postRequest<ServiceStartResponse>('mariadb.start', payload);
}

export function mariadbStop(payload: { mariadbId: string }) {
  return postRequest<ServiceStopResponse>('mariadb.stop', payload);
}
