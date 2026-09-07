import { makeUpdateDelete } from "@/lib/crud-factory";
import { locationSchema } from "@/lib/validations/master";

export const { PUT, DELETE } = makeUpdateDelete({
  model: "location",
  entityType: "Location",
  schema: locationSchema,
});
