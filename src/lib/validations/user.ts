import { z } from "zod";

const roleEnum = z.enum(["SUPER_ADMIN", "ASSET_MANAGER", "ASSET_HANDLER"]);

const emptyToNull = (v: unknown) =>
  v === "" || v === undefined ? null : v;

// Profil (semua opsional). String kosong → null agar rapi di DB.
export const userProfileSchema = z.object({
  // Personal
  nickname: z.preprocess(emptyToNull, z.string().nullable().optional()),
  birthPlace: z.preprocess(emptyToNull, z.string().nullable().optional()),
  birthDate: z.preprocess(emptyToNull, z.string().nullable().optional()),
  gender: z.preprocess(
    emptyToNull,
    z.enum(["MALE", "FEMALE"]).nullable().optional()
  ),
  maritalStatus: z.preprocess(
    emptyToNull,
    z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]).nullable().optional()
  ),
  nik: z.preprocess(emptyToNull, z.string().nullable().optional()),
  kkNumber: z.preprocess(emptyToNull, z.string().nullable().optional()),
  npwp: z.preprocess(emptyToNull, z.string().nullable().optional()),
  passportNumber: z.preprocess(emptyToNull, z.string().nullable().optional()),
  addressKtp: z.preprocess(emptyToNull, z.string().nullable().optional()),
  addressDomicile: z.preprocess(emptyToNull, z.string().nullable().optional()),
  personalEmail: z.preprocess(
    emptyToNull,
    z.string().email("Email pribadi tidak valid").nullable().optional()
  ),
  emergencyName: z.preprocess(emptyToNull, z.string().nullable().optional()),
  emergencyRelation: z.preprocess(
    emptyToNull,
    z.string().nullable().optional()
  ),
  emergencyPhone: z.preprocess(emptyToNull, z.string().nullable().optional()),

  // Kepegawaian
  employeeId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  jobTitle: z.preprocess(emptyToNull, z.string().nullable().optional()),
  department: z.preprocess(emptyToNull, z.string().nullable().optional()),
  level: z.preprocess(emptyToNull, z.string().nullable().optional()),
  workLocation: z.preprocess(emptyToNull, z.string().nullable().optional()),
  joinDate: z.preprocess(emptyToNull, z.string().nullable().optional()),
  endDate: z.preprocess(emptyToNull, z.string().nullable().optional()),
  employmentStatus: z.preprocess(
    emptyToNull,
    z
      .enum(["PERMANENT", "CONTRACT", "INTERNSHIP", "FREELANCE"])
      .nullable()
      .optional()
  ),
});

export const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: roleEnum,
  phone: z.preprocess(emptyToNull, z.string().nullable().optional()),
  reportsToId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  profile: userProfileSchema.optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").optional(),
  email: z.string().email("Email tidak valid").optional(),
  password: z
    .preprocess(emptyToNull, z.string().min(6, "Password minimal 6 karakter").nullable().optional()),
  role: roleEnum.optional(),
  isActive: z.boolean().optional(),
  phone: z.preprocess(emptyToNull, z.string().nullable().optional()),
  reportsToId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  profile: userProfileSchema.optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;

/** Ubah string tanggal (yyyy-mm-dd) → Date | null untuk field profil. */
export function profileToPrisma(
  profile: UserProfileInput | undefined
): Record<string, unknown> {
  if (!profile) return {};
  const dateFields = ["birthDate", "joinDate", "endDate"] as const;
  const out: Record<string, unknown> = { ...profile };
  for (const f of dateFields) {
    const v = out[f];
    out[f] = v ? new Date(v as string) : null;
  }
  return out;
}
