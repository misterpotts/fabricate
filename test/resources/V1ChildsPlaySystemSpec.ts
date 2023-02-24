import {V1SystemJson} from "../../src/scripts/system/setting_versions/V1Json";

const V1_CHILDS_PLAY_SYSTEM_DEFINITION: V1SystemJson = {
  "id": "VMjcCEagWtutgKi3",
  "details": {
    "name": "Child's Play",
    "summary": "A demo system",
    "description": "",
    "author": "Gamemaster"
  },
  "enabled": true,
  "locked": false,
  "parts": {
    "components": {
      "Item.B3zDhh2OsXhfBrpA": {
        "itemUuid": "Item.B3zDhh2OsXhfBrpA",
        "essences": {
          "iSS9Vy6mLUTZ4K2i": 1,
          "JMRPrw4231ryQO45": 1
        },
        "salvage": {}
      },
      "Item.I7SjtltffaXBZ7jl": {
        "itemUuid": "Item.I7SjtltffaXBZ7jl",
        "essences": {
          "iSS9Vy6mLUTZ4K2i": 1
        },
        "salvage": {}
      },
      "Item.qefRHSJYoNK7m7wE": {
        "itemUuid": "Item.qefRHSJYoNK7m7wE",
        "essences": {
          "JMRPrw4231ryQO45": 1
        },
        "salvage": {}
      },
      "Item.NxAfHbjx9oou5gZj": {
        "itemUuid": "Item.NxAfHbjx9oou5gZj",
        "essences": {},
        "salvage": {}
      },
      "Item.lCVwi68NxCV6wQGL": {
        "itemUuid": "Item.lCVwi68NxCV6wQGL",
        "essences": {},
        "salvage": {}
      }
    },
    "recipes": {
      "Item.DnpnEdjUa5N6crx4": {
        "itemUuid": "Item.DnpnEdjUa5N6crx4",
        "essences": {},
        "catalysts": {},
        "resultGroups": [
          {
            "Item.NxAfHbjx9oou5gZj": 1
          }
        ],
        "ingredientGroups": [
          {
            "Item.B3zDhh2OsXhfBrpA": 1,
            "Item.I7SjtltffaXBZ7jl": 1,
            "Item.qefRHSJYoNK7m7wE": 1
          }
        ]
      },
      "Item.8eSOM7wzoEYMvh42": {
        "itemUuid": "Item.8eSOM7wzoEYMvh42",
        "essences": {},
        "catalysts": {},
        "resultGroups": [
          {
            "Item.lCVwi68NxCV6wQGL": 1
          }
        ],
        "ingredientGroups": [
          {
            "Item.B3zDhh2OsXhfBrpA": 3,
            "Item.I7SjtltffaXBZ7jl": 2,
            "Item.qefRHSJYoNK7m7wE": 2
          },
          {
            "Item.NxAfHbjx9oou5gZj": 1,
            "Item.B3zDhh2OsXhfBrpA": 1,
            "Item.I7SjtltffaXBZ7jl": 1,
            "Item.qefRHSJYoNK7m7wE": 1
          }
        ]
      }
    },
    "essences": {
      "iSS9Vy6mLUTZ4K2i": {
        "id": "iSS9Vy6mLUTZ4K2i",
        "name": "Water",
        "tooltip": "Water",
        "iconCode": "fa-solid fa-droplet",
        "description": ""
      },
      "JMRPrw4231ryQO45": {
        "id": "JMRPrw4231ryQO45",
        "name": "Earth",
        "tooltip": "Earth",
        "iconCode": "fa-solid fa-mountain",
        "description": ""
      },
      "FNJYisoUcSyTANi7": {
        "id": "FNJYisoUcSyTANi7",
        "name": "Fire",
        "tooltip": "Fire",
        "iconCode": "fa-solid fa-fire",
        "description": ""
      },
      "BMmOAtAArVTjhfOR": {
        "id": "BMmOAtAArVTjhfOR",
        "name": "Wind",
        "tooltip": "Wind",
        "iconCode": "fa-solid fa-wind",
        "description": ""
      }
    }
  }
}

export default V1_CHILDS_PLAY_SYSTEM_DEFINITION;