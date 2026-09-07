import { makeListCreate } from "@/lib/crud-factory";
import { locationSchema } from "@/lib/validations/master";

export const { GET, POST } = makeListCreate({
  model: "location",
  entityType: "Location",
  schema: locationSchema,
  include: { _count: { select: { assets: true } } },
});
