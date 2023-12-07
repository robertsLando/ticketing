// eslint-disable-next-line @nx/enforce-module-boundaries
import packageInfo from 'package.json';

import { Environment, VersioningType } from './env.interface';
import { getApiVersion } from './helpers';

const version = packageInfo.version;
const apiVersion = getApiVersion(version);

export const environment: Environment = {
  production: false,
  environment: 'development',
  version,
  apiVersion,
  versioningType: VersioningType.HEADER,
  apiBaseDomain: 'localhost:80',
  // apiBaseDomain: 'ticketing.dev',
  useUnsafeConnection: true,
  stripePublishableKey: '',
  oryBasePath: 'http://localhost:4000',
};
