import { Spinner } from '@chakra-ui/spinner';
import { isErrorResource, isLoadingResource, Resource as IResource } from '@bubble-tea/base';

export interface ResourceProps<T> {
  resource?: IResource<T>;
  children?: (data: T) => React.ReactNode;
  fallback?: React.ReactNode | ((error: any) => React.ReactNode);
  loading?: React.ReactNode;
}

export default function Resource<T>({ resource, children, loading, fallback = null }: ResourceProps<T>) {
  if (!resource) return null;
  if (isLoadingResource(resource)) return loading || <Spinner />;
  if (isErrorResource(resource)) return typeof fallback === 'function' ? fallback(resource.error) : fallback;
  if (children) return children(resource.data);
  return null;
}
