# Nuxt Cards

## Introduction

Nuxt Cards is a Nuxt module that provides a set of pre-designed card components for use in your Nuxt applications. It allows you to easily create visually appealing cards with various styles and layouts.

### JSON

Schema>

```json
{
  "type": "object",
  "properties": {
    "deck": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the deck"
        },

        "filename": {
          "type": "string",
          "description": "File name of the deck"
        },
        ,
        "name": {
          "type": "string",
          "description": "Name of the deck"
        },
        "description": {
          "type": "string",
          "description": "Description of the deck"
        },
        "cards": {
          "type": "object",
          "additionalProperties": {
            "type": "object",
            "properties": {
              "front": {
                "type": "string",
                "description": "Front side of the card"
              },
              "back": {
                "type": "string",
                "description": "Back side of the card"
              }
            },
            "required": ["front", "back"]
          },
          "description": "Collection of cards in the deck"
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Tags associated with the deck"
        }
      },
      "required": ["id", "name", "cards"]
    }
  },
  "required": ["deck"]
}
```
