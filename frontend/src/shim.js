import { Buffer } from 'buffer';
import * as process from 'process';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.process = process;
} 