import useSWR, { type SWRConfiguration } from 'swr';

import { getRequest, postRequest } from '@/lib/http';
import { useActiveOrganizationSWRKey } from '@/lib/organization-swr-key';
import type { ComposeOneResponse } from '@/types/compose';
import type {
  ServiceDeployResponse,
  ServiceStartResponse,
  ServiceStopResponse,
} from '@/types/application-actions';

export function useComposeOne(
  composeId: string | undefined,
  config?: SWRConfiguration<ComposeOneResponse>
) {
  const key = useActiveOrganizationSWRKey(composeId ? ['compose.one', composeId] : null);

  return useSWR<ComposeOneResponse>(key, () => getRequest('compose.one', { composeId }), config);
}

export function composeDeploy(payload: {
  composeId: string;
  title?: string;
  description?: string;
}) {
  return postRequest<ServiceDeployResponse>('compose.deploy', payload);
}

export function composeRedeploy(payload: {
  composeId: string;
  title?: string;
  description?: string;
}) {
  return postRequest<ServiceDeployResponse>('compose.redeploy', payload);
}

export function composeStart(payload: { composeId: string }) {
  return postRequest<ServiceStartResponse>('compose.start', payload);
}

export function composeStop(payload: { composeId: string }) {
  return postRequest<ServiceStopResponse>('compose.stop', payload);
}
