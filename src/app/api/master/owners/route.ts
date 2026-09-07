import { makeListCreate } from "@/lib/crud-factory";
import { ownerSchema } from "@/lib/validations/master";

export const { GET, POST } = makeListCreate({
  model: "owner",
  entityType: "Owner",
  schema: ownerSchema,
  include: { _count: { select: { assets: true } } },
});
