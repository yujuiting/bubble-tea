import { env } from '@bubble-tea/base';
import dotenv from 'dotenv';

dotenv.config();

export const mongodbUri = env('MONGODB_URI');
