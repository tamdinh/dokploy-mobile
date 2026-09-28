import useSWR, { type SWRConfiguration } from 'swr';

import { getRequest, postRequest } from '@/lib/http';
import { useActiveOrganizationSWRKey } from '@/lib/organization-swr-key';
import type { MongoOneResponse } from '@/types/mongo';
import type {
  MongoSaveEnvironmentRequest,
  MongoSaveEnvironmentResponse,
} from '@/types/environment-actions';
import type {
  ServiceDeployResponse,
  ServiceRebuildResponse,
  ServiceReloadResponse,
  ServiceStartResponse,
  ServiceStopResponse,
} from '@/types/application-actions';

export function useMongoOne(
  mongoId: string | undefined,
  config?: SWRConfiguration<MongoOneResponse>
) {
  const key = useActiveOrganizationSWRKey(mongoId ? ['mongo.one', mongoId] : null);

  return useSWR<MongoOneResponse>(key, () => getRequest('mongo.one', { mongoId }), config);
}

export function mongoSaveEnvironment(payload: MongoSaveEnvironmentRequest) {
  return postRequest<MongoSaveEnvironmentResponse>('mongo.saveEnvironment', payload);
}

export function mongoDeploy(payload: { mongoId: string }) {
  return postRequest<ServiceDeployResponse>('mongo.deploy', payload);
}

export function mongoReload(payload: { mongoId: string; appName: string }) {
  return postRequest<ServiceReloadResponse>('mongo.reload', payload);
}

export function mongoRebuild(payload: { mongoId: string }) {
  return postRequest<ServiceRebuildResponse>('mongo.rebuild', payload);
}

export function mongoStart(payload: { mongoId: string }) {
  return postRequest<ServiceStartResponse>('mongo.start', payload);
}

export function mongoStop(payload: { mongoId: string }) {
  return postRequest<ServiceStopResponse>('mongo.stop', payload);
}
