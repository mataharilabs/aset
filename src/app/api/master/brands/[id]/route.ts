import { makeUpdateDelete } from "@/lib/crud-factory";
import { brandSchema } from "@/lib/validations/master";

export const { PUT, DELETE } = makeUpdateDelete({
  model: "brand",
  entityType: "Brand",
  schema: brandSchema,
});
