'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Category = { label: string; value: string };

export default function TabsNavigation({
  categories,
}: {
  categories: Category[];
}) {
  const pathname = usePathname();
  const activeCategory =
    categories.find(c => pathname.endsWith(c.value))?.value || 'account';

  return (
    <div>
      <Tabs value={activeCategory}>
        <TabsList>
          {categories.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value} asChild>
              <Link href={`/settings/${cat.value}`}>{cat.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
