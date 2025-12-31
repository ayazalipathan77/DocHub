import { DocumentData } from './types';

export const APP_NAME = "DocuHub AI";

export const CATEGORIES = [
  'SRS',
  'Data Dictionary',
  'CRF',
  'Integration',
  'Technical',
  'General'
] as const;

export const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Sales',
  'HR',
  'Legal'
];

export const MOCK_DOCUMENTS: DocumentData[] = [
  {
    id: '1',
    title: 'Payment Gateway Integration V2',
    category: 'Integration',
    department: 'Engineering',
    author: 'Alice Chen',
    version: '2.0.1',
    uploadDate: '2023-10-15T10:30:00Z',
    tags: ['api', 'payments', 'stripe', 'checkout'],
    summary: 'Technical specification for integrating Stripe Connect into the main platform checkout flow.',
    contentHtml: '<h1>Payment Gateway Integration</h1><p>This document outlines the steps to integrate Stripe.</p><h2>Endpoints</h2><p>POST /api/pay</p>',
    rawText: 'Payment Gateway Integration This document outlines the steps to integrate Stripe. Endpoints POST /api/pay'
  },
  {
    id: '2',
    title: 'Q4 Product Roadmap SRS',
    category: 'SRS',
    department: 'Product',
    author: 'Bob Smith',
    version: '1.0',
    uploadDate: '2023-11-01T09:15:00Z',
    tags: ['roadmap', 'features', 'q4', 'requirements'],
    summary: 'Software Requirements Specification for the Q4 planned features including AI search.',
    contentHtml: '<h1>Q4 Roadmap</h1><p>We plan to launch the AI search module.</p><ul><li>Feature A</li><li>Feature B</li></ul>',
    rawText: 'Q4 Roadmap We plan to launch the AI search module. Feature A Feature B'
  },
  {
    id: '3',
    title: 'Customer Data Dictionary',
    category: 'Data Dictionary',
    department: 'Engineering',
    author: 'Charlie Data',
    version: '3.4',
    uploadDate: '2023-09-20T14:00:00Z',
    tags: ['database', 'schema', 'customer', 'pii'],
    summary: 'Definitions of all customer-related database fields and privacy classifications.',
    contentHtml: '<h1>Customer Table</h1><p><b>user_id</b>: UUID, Primary Key.</p><p><b>email</b>: Varchar, Unique, PII.</p>',
    rawText: 'Customer Table user_id: UUID, Primary Key. email: Varchar, Unique, PII.'
  }
];
