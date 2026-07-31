
import { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from '@/lib/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const getSearchBasePath = (pathname: string) => {
  if (pathname.startsWith('/categories/') || pathname.startsWith('/categories')) {
    return pathname;
  }
  return '/products';
};

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set('search', query);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      router.push(`${getSearchBasePath(pathname)}?${params.toString()}`);
    },
    [query, router, searchParams, pathname]
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.push(`${getSearchBasePath(pathname)}?${params.toString()}`);
  }, [router, searchParams, pathname]);

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-lg">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="pl-10 pr-10"
      />
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
