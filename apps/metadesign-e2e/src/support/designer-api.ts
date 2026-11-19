import { APIRequestContext, expect } from '@playwright/test';

export interface RevisionResponse {
  revision: string;
}

export async function resetFixtures(request: APIRequestContext): Promise<RevisionResponse> {
  const response = await request.post('/designer/reset');
  expect(response.ok(), `reset failed: ${response.status()}`).toBeTruthy();

  return await response.json();
}

export async function getRevision(request: APIRequestContext): Promise<string> {
  const response = await request.get('/designer/revision');
  expect(response.ok(), `revision failed: ${response.status()}`).toBeTruthy();

  const body = await response.json();

  return body.revision as string;
}

export async function setOverlay(
  request: APIRequestContext,
  kind: string,
  id: string,
  overlay: Record<string, unknown>
): Promise<RevisionResponse> {
  const response = await request.post(`/designer/overlay/${kind}/${id}`, { data: overlay });
  expect(response.ok(), `set overlay failed: ${response.status()}`).toBeTruthy();

  return await response.json();
}

export async function getOverlay(
  request: APIRequestContext,
  kind: string,
  id: string
): Promise<Record<string, unknown> | null> {
  const response = await request.get(`/designer/overlay/${kind}/${id}`);
  expect(response.ok(), `get overlay failed: ${response.status()}`).toBeTruthy();

  const body = await response.json();

  return (body.overlay ?? null) as Record<string, unknown> | null;
}

export async function listOverlays(
  request: APIRequestContext,
  kind: string
): Promise<Array<{ kind: string; id: string }>> {
  const response = await request.get(`/designer/overlay/${kind}`);
  expect(response.ok(), `list overlays failed: ${response.status()}`).toBeTruthy();

  const body = await response.json();

  return (body.overlays ?? []) as Array<{ kind: string; id: string }>;
}
