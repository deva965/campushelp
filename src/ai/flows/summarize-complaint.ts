'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a short AI-powered summary of a complaint for admin review.
 *
 * - summarizeComplaint - A function that takes complaint details as input and returns a concise summary.
 * - SummarizeComplaintInput - The input type for the summarizeComplaint function.
 * - SummarizeComplaintOutput - The output type for the summarizeComplaint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeComplaintInputSchema = z.object({
  title: z.string().describe('The title of the complaint.'),
  description: z.string().describe('The detailed description of the complaint.'),
  category: z.string().describe('The category of the complaint (e.g., Maintenance, Cleanliness, Safety).'),
  location: z.string().describe('The location of the complaint.'),
  imageUri: z
    .string()
    .optional()
    .describe(
      "A photo related to the complaint, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type SummarizeComplaintInput = z.infer<typeof SummarizeComplaintInputSchema>;

const SummarizeComplaintOutputSchema = z.object({
  summary: z.string().describe('A short, AI-generated summary of the complaint.'),
});

export type SummarizeComplaintOutput = z.infer<typeof SummarizeComplaintOutputSchema>;

export async function summarizeComplaint(input: SummarizeComplaintInput): Promise<SummarizeComplaintOutput> {
  return summarizeComplaintFlow(input);
}

const summarizeComplaintPrompt = ai.definePrompt({
  name: 'summarizeComplaintPrompt',
  input: {schema: SummarizeComplaintInputSchema},
  output: {schema: SummarizeComplaintOutputSchema},
  prompt: `You are an AI assistant helping admins quickly understand complaints.\n\n  Given the details of a complaint, generate a concise summary that highlights the key issue.\n\n  Title: {{{title}}}\n  Description: {{{description}}}\n  Category: {{{category}}}\n  Location: {{{location}}}\n  {{#if imageUri}}
  Image: {{media url=imageUri}}\n  {{/if}}\n\n  Summary: `,
});

const summarizeComplaintFlow = ai.defineFlow(
  {
    name: 'summarizeComplaintFlow',
    inputSchema: SummarizeComplaintInputSchema,
    outputSchema: SummarizeComplaintOutputSchema,
  },
  async input => {
    const {output} = await summarizeComplaintPrompt(input);
    return output!;
  }
);
