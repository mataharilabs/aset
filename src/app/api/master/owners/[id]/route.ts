import { makeUpdateDelete } from "@/lib/crud-factory";
import { ownerSchema } from "@/lib/validations/master";

export const { PUT, DELETE } = makeUpdateDelete({
  model: "owner",
  entityType: "Owner",
  schema: ownerSchema,
});
