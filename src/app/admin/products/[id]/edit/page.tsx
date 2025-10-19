import db from "@/db/db"
import { PageHeader } from '../../../_components/pageHeader';
import { ProductForm } from '../../_components/ProductsForm';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params  // await the promise
  
  const product = await db.product.findUnique({ where: { id } })

  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <ProductForm product={product} />
    </>
  )
}