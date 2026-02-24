import { defineCollection, z } from 'astro:content';

const baseCodeSchema = {
  code: z.string().min(1),
  shortLabel: z.string().min(1),
  summary: z.string().optional(),
  lastmod: z.string().min(1),
  source: z.literal('google-doc'),
  sourceDocId: z.string().min(1),
};

const healthcareCodes = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseCodeSchema,
    industry: z.literal('healthcare'),
  }),
});

const irsTaxCodes = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseCodeSchema,
    industry: z.literal('irs-tax'),
  }),
});

const bankingCodes = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseCodeSchema,
    industry: z.literal('banking'),
  }),
});

const gamingCodes = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseCodeSchema,
    industry: z.literal('gaming'),
  }),
});

const applianceCodes = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseCodeSchema,
    industry: z.literal('appliances'),
    applianceType: z.string().min(1),
    brand: z.string().min(1),
    seriesOrModel: z.string().min(1),
  }),
});

export const collections = {
  healthcareCodes,
  irsTaxCodes,
  bankingCodes,
  gamingCodes,
  applianceCodes,
};
