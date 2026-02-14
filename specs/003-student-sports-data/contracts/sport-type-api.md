# Sport Type API Contract

**Base URL**: `/api/v1/sport-types`
**Authentication**: Required (JWT Bearer Token)

## Overview

Sport types are system-defined and cannot be created, updated, or deleted by users in the MVP. This API provides read-only access to the 17 predefined sport types.

## Endpoints

### List Sport Types

```
GET /api/v1/sport-types
```

**Description**: Get all available sport types, optionally filtered by category.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by category (體適能/田徑/球類) |

**Response** (200 OK):
```json
{
  "data": {
    "sport_types": [
      {
        "id": 1,
        "name": "800公尺",
        "category": "體適能",
        "default_unit": "秒",
        "value_type": "time"
      },
      {
        "id": 2,
        "name": "1600公尺",
        "category": "體適能",
        "default_unit": "秒",
        "value_type": "time"
      },
      {
        "id": 3,
        "name": "坐姿體前彎",
        "category": "體適能",
        "default_unit": "公分",
        "value_type": "distance"
      }
    ]
  }
}
```

**Response with Category Filter** (200 OK):
```
GET /api/v1/sport-types?category=體適能
```
```json
{
  "data": {
    "sport_types": [
      {
        "id": 1,
        "name": "800公尺",
        "category": "體適能",
        "default_unit": "秒",
        "value_type": "time"
      },
      {
        "id": 2,
        "name": "1600公尺",
        "category": "體適能",
        "default_unit": "秒",
        "value_type": "time"
      },
      {
        "id": 3,
        "name": "坐姿體前彎",
        "category": "體適能",
        "default_unit": "公分",
        "value_type": "distance"
      },
      {
        "id": 4,
        "name": "1分鐘仰臥起坐",
        "category": "體適能",
        "default_unit": "次",
        "value_type": "count"
      },
      {
        "id": 5,
        "name": "立定跳遠",
        "category": "體適能",
        "default_unit": "公分",
        "value_type": "distance"
      },
      {
        "id": 6,
        "name": "1分鐘屈膝仰臥起坐",
        "category": "體適能",
        "default_unit": "次",
        "value_type": "count"
      }
    ]
  }
}
```

---

### Get Sport Type by ID

```
GET /api/v1/sport-types/:id
```

**Description**: Get detailed information about a specific sport type.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Sport Type ID |

**Response** (200 OK):
```json
{
  "data": {
    "sport_type": {
      "id": 1,
      "name": "800公尺",
      "category": "體適能",
      "default_unit": "秒",
      "value_type": "time"
    }
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "error": {
    "code": "SPORT_TYPE_NOT_FOUND",
    "message": "運動項目不存在",
    "status": 404
  }
}
```

---

## Complete Sport Type List

### 體適能標準項目 (Fitness Tests)

| ID | Name | Default Unit | Value Type |
|----|------|--------------|------------|
| 1 | 800公尺 | 秒 | time |
| 2 | 1600公尺 | 秒 | time |
| 3 | 坐姿體前彎 | 公分 | distance |
| 4 | 1分鐘仰臥起坐 | 次 | count |
| 5 | 立定跳遠 | 公分 | distance |
| 6 | 1分鐘屈膝仰臥起坐 | 次 | count |

### 田徑基礎項目 (Track & Field)

| ID | Name | Default Unit | Value Type |
|----|------|--------------|------------|
| 7 | 100公尺 | 秒 | time |
| 8 | 200公尺 | 秒 | time |
| 9 | 400公尺 | 秒 | time |
| 10 | 跳遠 | 公分 | distance |
| 11 | 跳高 | 公分 | distance |
| 12 | 鉛球 | 公尺 | distance |
| 13 | 壘球擲遠 | 公尺 | distance |

### 球類基礎測驗 (Ball Sports)

| ID | Name | Default Unit | Value Type |
|----|------|--------------|------------|
| 14 | 籃球運球 | 秒 | time |
| 15 | 足球運球 | 秒 | time |
| 16 | 排球墊球 | 次 | count |
| 17 | 桌球正手擊球 | 次 | count |

---

## Value Type Interpretation

| Value Type | Description | Example |
|------------|-------------|---------|
| time | Duration in seconds | 180.5 = 3 minutes 0.5 seconds |
| distance | Distance measurement | 250 = 250 cm or 2.5 m (depends on unit) |
| count | Number of repetitions | 35 = 35 times |
| score | Point-based score | 85 = 85 points |

**Note**: The `score` value type is reserved for future use. Current MVP only uses `time`, `distance`, and `count`.
