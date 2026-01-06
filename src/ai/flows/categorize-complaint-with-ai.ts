'use server';
/**
 * @fileOverview An AI agent that categorizes complaints based on their description and images.
 *
 * - categorizeComplaint - A function that handles the complaint categorization process.
 * - CategorizeComplaintInput - The input type for the categorizeComplaint function.
 * - CategorizeComplaintOutput - The return type for the categorizeComplaint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ComplaintCategorySchema = z.enum([
  'Maintenance',
  'Cleanliness',
  'Safety',
  'Water',
  'Electricity',
  'Other',
]);

const CategorizeComplaintInputSchema = z.object({
  description: z.string().describe('The description of the complaint.'),
  imageUri: z
    .string()
    .optional()
    .describe(
      "A photo related to the complaint, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  title: z.string().describe('The title of the complaint.'),
  location: z.string().describe('The location of the complaint.'),
});
export type CategorizeComplaintInput = z.infer<typeof CategorizeComplaintInputSchema>;

const CategorizeComplaintOutputSchema = z.object({
  category: ComplaintCategorySchema.describe('The predicted category of the complaint.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence level of the category prediction.'),
});
export type CategorizeComplaintOutput = z.infer<typeof CategorizeComplaintOutputSchema>;

export async function categorizeComplaint(input: CategorizeComplaintInput): Promise<CategorizeComplaintOutput> {
  return categorizeComplaintFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeComplaintPrompt',
  input: {schema: CategorizeComplaintInputSchema},
  output: {schema: CategorizeComplaintOutputSchema},
  prompt: `You are an AI assistant that categorizes user complaints.

  Based on the title, description, location and attached image (if any), determine the most appropriate category for the complaint.

  The possible categories are: Maintenance, Cleanliness, Safety, Water, Electricity, Other.

  Title: {{{title}}}
  Description: {{{description}}}
  Location: {{{location}}}
  {{#if imageUri}}
  Image: {{media url=imageUri}}
  {{/if}}

  Respond with the category and your confidence level (0-1) in your prediction.`,
});

const categorizeComplaintFlow = ai.defineFlow(
  {
    name: 'categorizeComplaintFlow',
    inputSchema: CategorizeComplaintInputSchema,
    outputSchema: CategorizeComplaintOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
