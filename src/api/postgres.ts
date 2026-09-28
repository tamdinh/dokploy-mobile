import useSWR, { type SWRConfiguration } from 'swr';

import { getRequest, postRequest } from '@/lib/http';
import { useActiveOrganizationSWRKey } from '@/lib/organization-swr-key';
import type { PostgresOneResponse } from '@/types/postgres';
import type {
  PostgresSaveEnvironmentRequest,
  PostgresSaveEnvironmentResponse,
} from '@/types/environment-actions';
import type {
  ServiceDeployResponse,
  ServiceRebuildResponse,
  ServiceReloadResponse,
  ServiceStartResponse,
  ServiceStopResponse,
} from '@/types/application-actions';

export function usePostgresOne(
  postgresId: string | undefined,
  config?: SWRConfiguration<PostgresOneResponse>
) {
  const key = useActiveOrganizationSWRKey(postgresId ? ['postgres.one', postgresId] : null);

  return useSWR<PostgresOneResponse>(key, () => getRequest('postgres.one', { postgresId }), config);
}

export function postgresSaveEnvironment(payload: PostgresSaveEnvironmentRequest) {
  return postRequest<PostgresSaveEnvironmentResponse>('postgres.saveEnvironment', payload);
}

export function postgresDeploy(payload: { postgresId: string }) {
  return postRequest<ServiceDeployResponse>('postgres.deploy', payload);
}

export function postgresReload(payload: { postgresId: string; appName: string }) {
  return postRequest<ServiceReloadResponse>('postgres.reload', payload);
}

export function postgresRebuild(payload: { postgresId: string }) {
  return postRequest<ServiceRebuildResponse>('postgres.rebuild', payload);
}

export function postgresStart(payload: { postgresId: string }) {
  return postRequest<ServiceStartResponse>('postgres.start', payload);
}

export function postgresStop(payload: { postgresId: string }) {
  return postRequest<ServiceStopResponse>('postgres.stop', payload);
}
