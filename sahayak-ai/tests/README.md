# Automated Test Suite

This folder contains the production-grade Jest test suite for the `sahayak-ai` pipeline.

## Run tests

From the `sahayak-ai` directory:

- `npm test`
- `npm run test:watch`

## Coverage

- `tests/mocks/mockData.ts` contains all reusable fixtures for keywords, user profiles, and scheme definitions.
- `tests/nlp.test.ts` validates multilingual refinement, noise stripping, and translation API mocking.
- `tests/filters.test.ts` validates hard exclusion rules (gender, age, category, income, expiry).
- `tests/parser.test.ts` validates metadata extraction, deadline parsing, procedural sections, and terms handling.
- `tests/scorer.test.ts` validates revenue-weighted scoring, sort modes, and score normalization.

## Notes

- External translation calls are mocked via `global.fetch` in `tests/nlp.test.ts`.
- All test input data is centralized in `tests/mocks/mockData.ts`.
