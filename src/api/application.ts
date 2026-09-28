import useSWR, { type SWRConfiguration } from 'swr';

import type { ApplicationOneResponse } from '@/types/application';
import type {
  ApplicationReloadRequest,
  ApplicationReloadResponse,
  ApplicationRedeployRequest,
  ApplicationRedeployResponse,
  ApplicationStartRequest,
  ApplicationStartResponse,
  ApplicationStopRequest,
  ApplicationStopResponse,
} from '@/types/application-actions';
import type {
  ApplicationSaveEnvironmentRequest,
  ApplicationSaveEnvironmentResponse,
} from '@/types/environment-actions';
import { getRequest, postRequest } from '@/lib/http';
import { useActiveOrganizationSWRKey } from '@/lib/organization-swr-key';

export function useApplicationOne(
  applicationId: string | undefined,
  config?: SWRConfiguration<ApplicationOneResponse>
) {
  const key = useActiveOrganizationSWRKey(
    applicationId ? ['application.one', applicationId] : null
  );

  return useSWR<ApplicationOneResponse>(
    key,
    () => getRequest('application.one', { applicationId }),
    config
  );
}

export function applicationReload(payload: ApplicationReloadRequest) {
  return postRequest<ApplicationReloadResponse>('application.reload', payload);
}

export function applicationRedeploy(payload: ApplicationRedeployRequest) {
  return postRequest<ApplicationRedeployResponse>('application.redeploy', payload);
}

export function applicationStart(payload: ApplicationStartRequest) {
  return postRequest<ApplicationStartResponse>('application.start', payload);
}

export function applicationStop(payload: ApplicationStopRequest) {
  return postRequest<ApplicationStopResponse>('application.stop', payload);
}

export function applicationSaveEnvironment(payload: ApplicationSaveEnvironmentRequest) {
  return postRequest<ApplicationSaveEnvironmentResponse>('application.saveEnvironment', payload);
}
