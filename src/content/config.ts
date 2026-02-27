import { defineCollection, z } from 'astro:content';

const baseCodeSchema = z.object({
  code: z.string().min(1),
  shortLabel: z.string().min(1),
  summary: z.string().optional(),
  lastmod: z.string().min(1),
  source: z.enum(['google-doc', 'manual']),
  sourceDocId: z.string().optional(),
});

const withGoogleDocValidation = <T extends z.ZodTypeAny>(schema: T) =>
  schema.superRefine((data: any, ctx) => {
    if (data?.source === 'google-doc' && !data?.sourceDocId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'sourceDocId is required when source is google-doc',
        path: ['sourceDocId'],
      });
    }
  });

const healthcareCodes = defineCollection({
  type: 'content',
  schema: withGoogleDocValidation(
    baseCodeSchema.extend({
    industry: z.literal('healthcare'),
    })
  ),
});

const irsTaxCodes = defineCollection({
  type: 'content',
  schema: withGoogleDocValidation(
    baseCodeSchema.extend({
    industry: z.literal('irs-tax'),
    })
  ),
});

const bankingCodes = defineCollection({
  type: 'content',
  schema: withGoogleDocValidation(
    baseCodeSchema.extend({
    industry: z.literal('banking'),
    })
  ),
});

const gamingCodes = defineCollection({
  type: 'content',
  schema: withGoogleDocValidation(
    baseCodeSchema.extend({
    industry: z.literal('gaming'),
    })
  ),
});

const applianceCodes = defineCollection({
  type: 'content',
  schema: withGoogleDocValidation(
    baseCodeSchema.extend({
    industry: z.literal('appliances'),
    applianceType: z.string().min(1),
    brand: z.string().min(1),
    seriesOrModel: z.string().min(1),
    })
  ),
});

const systemCodes = defineCollection({
  type: 'content',
  schema: withGoogleDocValidation(
    baseCodeSchema.extend({
    industry: z.literal('systems'),
    subcategory: z.string().min(1),
    })
  ),
});

export const collections = {
  healthcareCodes,
  irsTaxCodes,
  bankingCodes,
  gamingCodes,
  applianceCodes,
  systemCodes,
};
