import { makeListCreate } from "@/lib/crud-factory";
import { brandSchema } from "@/lib/validations/master";

export const { GET, POST } = makeListCreate({
  model: "brand",
  entityType: "Brand",
  schema: brandSchema,
  include: { _count: { select: { assets: true } } },
});
