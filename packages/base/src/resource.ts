interface LoadingResource<T> {
  data?: T;
  error?: any;
  loading: true;
}

interface LoadedResource<T> {
  data: T;
  error?: any;
  loading: false;
}

interface ErrorResource {
  data?: any;
  error: any;
  loading: false;
}

export type Resource<T> = LoadingResource<T> | LoadedResource<T> | ErrorResource;

export function loadingResource<T>(data?: T): LoadingResource<T> {
  return { data, loading: true };
}

export function loadedResource<T>(data: T): LoadedResource<T> {
  return { data, loading: false };
}

export function errorResource(error: any): ErrorResource {
  return { error, loading: false };
}

export function isLoadingResource<T>(resource: Resource<T>): resource is LoadingResource<T> {
  return resource.loading;
}

export function isLoadedResource<T>(resource: Resource<T>): resource is LoadedResource<T> {
  return !isLoadingResource(resource) && !resource.error;
}

export function isErrorResource<T>(resource: Resource<T>): resource is ErrorResource {
  return !isLoadedResource(resource) && !!resource.error;
}
