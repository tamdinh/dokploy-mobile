import useSWR, { type SWRConfiguration } from 'swr';

import { getRequest, postRequest } from '@/lib/http';
import { useActiveOrganizationSWRKey } from '@/lib/organization-swr-key';
import type { MysqlOneResponse } from '@/types/mysql';
import type {
  MysqlSaveEnvironmentRequest,
  MysqlSaveEnvironmentResponse,
} from '@/types/environment-actions';
import type {
  ServiceDeployResponse,
  ServiceRebuildResponse,
  ServiceReloadResponse,
  ServiceStartResponse,
  ServiceStopResponse,
} from '@/types/application-actions';

export function useMysqlOne(
  mysqlId: string | undefined,
  config?: SWRConfiguration<MysqlOneResponse>
) {
  const key = useActiveOrganizationSWRKey(mysqlId ? ['mysql.one', mysqlId] : null);

  return useSWR<MysqlOneResponse>(key, () => getRequest('mysql.one', { mysqlId }), config);
}

export function mysqlSaveEnvironment(payload: MysqlSaveEnvironmentRequest) {
  return postRequest<MysqlSaveEnvironmentResponse>('mysql.saveEnvironment', payload);
}

export function mysqlDeploy(payload: { mysqlId: string }) {
  return postRequest<ServiceDeployResponse>('mysql.deploy', payload);
}

export function mysqlReload(payload: { mysqlId: string; appName: string }) {
  return postRequest<ServiceReloadResponse>('mysql.reload', payload);
}

export function mysqlRebuild(payload: { mysqlId: string }) {
  return postRequest<ServiceRebuildResponse>('mysql.rebuild', payload);
}

export function mysqlStart(payload: { mysqlId: string }) {
  return postRequest<ServiceStartResponse>('mysql.start', payload);
}

export function mysqlStop(payload: { mysqlId: string }) {
  return postRequest<ServiceStopResponse>('mysql.stop', payload);
}
