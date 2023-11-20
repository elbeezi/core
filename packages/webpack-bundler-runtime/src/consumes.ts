import { ConsumesOptions } from './types';
import { proxyShareScopeMap } from './proxyShareScopeMap';

export function consumes(options: ConsumesOptions) {
  const {
    chunkId,
    promises,
    chunkMapping,
    installedModules,
    moduleToHandlerMapping,
    webpackRequire,
  } = options;
  proxyShareScopeMap(webpackRequire);
  if (webpackRequire.o(chunkMapping, chunkId)) {
    chunkMapping[chunkId].forEach(id => {
      if (webpackRequire.o(installedModules, id)) {
        return promises.push(installedModules[id] as Promise<any>);
      }
      const onFactory = (factory: () => any) => {
        installedModules[id] = 0;
        webpackRequire.m[id] = module => {
          delete webpackRequire.c[id];
          module.exports = factory();
        };
      };
      const onError = (error: unknown) => {
        delete installedModules[id];
        webpackRequire.m[id] = module => {
          delete webpackRequire.c[id];
          throw error;
        };
      };
      try {
        const federationInstance = webpackRequire.federation.instance;
        if (!federationInstance) {
          throw new Error('Can not find federation Instance!');
        }
        const { shareKey, getter, shareInfo } = moduleToHandlerMapping[id];

        const promise = federationInstance
          .loadShare(shareKey, shareInfo)
          .then((factory: any) => {
            if (factory === false) {
              return getter();
            }
            return factory;
          });

        if (promise.then) {
          promises.push(
            (installedModules[id] = promise.then(onFactory).catch(onError)),
          );
        } else {
          // @ts-ignore keep prev logic
          onFactory(promise);
        }
      } catch (e) {
        onError(e);
      }
    });
  }
}
