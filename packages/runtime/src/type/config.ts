import type {
  RemoteWithEntry,
  RemoteWithVersion,
  Module,
  RemoteEntryType,
} from '@module-federation/sdk';
import { FederationRuntimePlugin } from './plugin';

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;
export type PartialOptional<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: T[P];
};

interface RemoteInfoCommon {
  alias?: string;
  shareScope?: string;
  type?: RemoteEntryType;
  entryGlobalName?: string;
}

export type RemoteInfoOptionalVersion = {
  name: string;
  version?: string;
} & RemoteInfoCommon;

export type Remote = (RemoteWithEntry | RemoteWithVersion) & RemoteInfoCommon;

export interface RemoteInfo {
  name: string;
  version?: string;
  buildVersion?: string;
  entry: string;
  type: RemoteEntryType;
  entryGlobalName: string;
  shareScope: string;
}

export type HostInfo = Pick<
Options,
'name' | 'version' | 'remotes' | 'version'
>;

export interface SharedConfig {
  singleton: boolean;
  requiredVersion: false | string;
  fixedDependencies: boolean | string[] | Array<string[]>;
  eager: boolean;
}

type SharedBaseArgs = {
  version: string;
  shareConfig?: SharedConfig;
  scope?: string | Array<string>;
  deps?: Array<string>;
  strategy: 'version-first' | 'loaded-first';
};

export type ShareArgs =
  | (SharedBaseArgs & { get: () => () => Module | Promise<() => Module> })
  | (SharedBaseArgs & { lib: () => Module });

export type SharedGetter = () => () => Promise<() => Module> | Module;

export type Shared = {
  version: string;
  get: SharedGetter;
  shareConfig: SharedConfig;
  scope: Array<string>;
  useIn: Array<string>;
  from: string;
  deps: Array<string>;
  lib?: () => Module;
  loaded?: boolean;
  loading?: null | Promise<any>;
  // compat prev shared
  eager?: boolean;
  strategy: 'version-first' | 'loaded-first';
};

export type GlobalShareScope = {
  [scope: string]: {
    [pkgName: string]: {
      [sharedVersion: string]: Shared;
    };
  };
};

export type ShareInfos = {
  [pkgName: string]: Shared;
};

export interface Options {
  id?: string;
  name: string;
  version?: string;
  remotes: Array<Remote>;
  shared: ShareInfos;
  plugins: Array<FederationRuntimePlugin>;
  inBrowser: boolean;
}

export type UserOptions = Omit<
Optional<Options, 'plugins'>,
'shared' | 'inBrowser'
> & {
  shared?: {
    [pkgName: string]: ShareArgs;
  };
};

export type LoadModuleOptions = {
  version?: string;
};

// 仅对旧的 federation provider 使用
export type RemoteEntryInitOptions = {
  version: string;
};

export type RemoteEntryExports = {
  get: (id: string) => () => Promise<Module>;
  init: (
    shareScope: GlobalShareScope[string],
    initScope?: Array<Record<string, never>>,
    remoteEntryInitOPtions?: RemoteEntryInitOptions,
  ) => void;
};
