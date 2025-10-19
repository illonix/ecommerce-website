import db from "@/db/db";
import type { Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "./../../components/ProductCard";
import { Suspense } from "react";
import { cache } from "@/lib/cache";

const getMostPopularProducts = cache(() => {
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { orders: { _count: "desc" } },
    take: 6,
  })
}, ["/", "getMostPopularProducts"], { revalidate: 60*60*24 })

const getNewestProducts = cache(() => {
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}, ["/", "getNewestProducts"]);

export default async function HomePage() {
  return (
    <main className="space-y-12">
      <ProductGridSection
        title="Most Popular Products"
        productsFetcher={getMostPopularProducts}
      />
      <ProductGridSection
        title="Newest Products"
        productsFetcher={getNewestProducts}
      />
    </main>
  );
}

type ProductType = Awaited<ReturnType<typeof db.product.findMany>>[number];

type ProductGridSectionProps = {
  title: string;
  productsFetcher: () => Promise<ProductType[]>;
};


function ProductGridSection({
  productsFetcher,
  title,
}: ProductGridSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button variant="outline" asChild>
          <Link href="/products">
            <span>View All</span>
            <ArrowRight className="size-4"> </ArrowRight>
          </Link>
        </Button>
      </div>
      <div
        className="grid grid-cols-1 md:grid-cols-2 
        lg:grid-cols-3 gap-4"
      >
        <Suspense fallback={
          <>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          
        </>}>
          <ProductSuspense productsFetcher={productsFetcher} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductSuspense({
  productsFetcher,
}: {
  productsFetcher: () => Promise<ProductType[]>;
}) {
  return (await productsFetcher()).map((product) => (
    <ProductCard key={product.id} {...product} />
  ));
}
