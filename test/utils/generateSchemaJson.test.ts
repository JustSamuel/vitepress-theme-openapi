import { describe, it, expect } from 'vitest';
import { generateSchemaJson } from '../../src/utils/generateSchemaJson';

describe('generateSchemaJson', () => {
  it('generates JSON for schema with string property', () => {
    const schema = {
      properties: {
        name: {
          type: 'string'
        }
      }
    }
    const result = generateSchemaJson(schema)
    expect(result).toBe(JSON.stringify({ name: 'string' }, null, 2))
  })

  it('generates JSON for schema with number property', () => {
    const schema = {
      properties: {
        age: {
          type: 'number'
        }
      }
    }
    const result = generateSchemaJson(schema)
    expect(result).toBe(JSON.stringify({ age: 0 }, null, 2))
  })

  it('generates JSON for schema with boolean property', () => {
    const schema = {
      properties: {
        isActive: {
          type: 'boolean'
        }
      }
    }
    const result = generateSchemaJson(schema)
    expect(result).toBe(JSON.stringify({ isActive: true }, null, 2))
  })

  it('generates JSON for schema with nested object property', () => {
    const schema = {
      properties: {
        address: {
          type: 'object',
          properties: {
            street: {
              type: 'string'
            }
          }
        }
      }
    }
    const result = generateSchemaJson(schema)
    expect(result).toBe(JSON.stringify({ address: { street: 'string' } }, null, 2))
  })

  it('generates JSON for schema with array property', () => {
    const schema = {
      properties: {
        tags: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    }
    const result = generateSchemaJson(schema)
    expect(result).toBe(JSON.stringify({ tags: [ { type: 'string' } ] }, null, 2))
  })

  it('generates JSON for schema with mixed properties', () => {
    const schema = {
      properties: {
        name: {
          type: 'string'
        },
        age: {
          type: 'number'
        },
        isActive: {
          type: 'boolean'
        }
      }
    }
    const result = generateSchemaJson(schema)
    expect(result).toBe(JSON.stringify({ name: 'string', age: 0, isActive: true }, null, 2))
  })

  it('generates JSON for empty schema', () => {
    const schema = {}
    const result = generateSchemaJson(schema)
    expect(result).toBe(JSON.stringify({}, null, 2))
  })

  it('generates JSON for null schema', () => {
    const schema = null
    const result = generateSchemaJson(schema)
    expect(result).toBe('null')
  })
});