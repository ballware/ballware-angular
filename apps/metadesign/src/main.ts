import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { createSandboxConfig, SandboxBootstrap } from './app/app.config';

const loadBootstrap = async (): Promise<SandboxBootstrap> => {
  const searchParams = new URLSearchParams(window.location.search);
  const tenant = searchParams.get('tenant');
  const user = searchParams.get('user');

  try {
    const response = await fetch(
      `/designer/bootstrap${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
      { headers: { Accept: 'application/json' } }
    );

    if (!response.ok) {
      throw new Error(`designer bootstrap responded with ${response.status}`);
    }

    return await response.json() as SandboxBootstrap;
  } catch (error) {
    console.warn('Falling back to defaults because designer bootstrap failed', error);

    return {
      tenant: { Id: tenant ?? 'e2e', Name: tenant ?? 'e2e' },
      user: { Id: user ?? 'e2e-user', Name: user ?? 'e2e-user' }
    };
  }
};

const main = async (): Promise<void> => {
  const bootstrap = await loadBootstrap();

  await bootstrapApplication(AppComponent, createSandboxConfig(bootstrap));
};

main().catch((error) => {
  console.error(error);
});
