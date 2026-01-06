import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-complaint-with-ai.ts';
import '@/ai/flows/generate-summary-of-complaints.ts';
import '@/ai/flows/summarize-complaint.ts';