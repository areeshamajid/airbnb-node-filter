# Airbnb Premium Listings Filter API 

**Author:** Areesha Majid  
*Node.js*

---

## Problem Statement

**Frontend Challenge:** This API implements a **jurisdiction toggle system** (`stateToggle=on`) that acts as a **backend gatekeeper**. When activated, it filters to **only premium listings** from approved states specified in `allowedStates` (**vic**, **nsw**, **qld**, **sa**, or any combination), ensuring **compliance** while serving the top-ranked properties.

## Overview

This project solves the **jurisdiction filtering problem** by:

- Loading **real Airbnb listings** from 4 Australian states (VIC, NSW, QLD, SA)
- Implementing **premium ranking** (reviews + LTM score) for each listing
- Exposing a **state toggle API** that supports **all states**:
  - `stateToggle=on&allowedStates=vic` → VIC only
  - `stateToggle=on&allowedStates=nsw` → NSW only  
  - `stateToggle=on&allowedStates=qld` → QLD only
  - `stateToggle=on&allowedStates=sa` → SA only
- Providing **interactive CLI** for testing all combinations
- Ensuring **Node.js backend validation** prevents unfiltered data exposure

## Table of Contents

- [Dataset](#dataset)
- [Architecture](#architecture)
- [Premium Ranking Logic](#premium-ranking-logic)
- [API Design](#api-design)
- [CLI Tool](#cli-tool)
- [How to Run](#how-to-run)
- [Future Improvements](#future-improvements)

## Dataset

**48k+ real Airbnb listings** across 4 Australian jurisdictions:

| State | Dataset | Total Listings |
|-------|---------|----------------|
| VIC   | Melbourne | 24,491 |
| NSW   | Sydney | 17,730 |
| QLD   | Brisbane | 6,147 |
| SA    | Barossa Valley | 353 |

Each CSV contains columns such as:

- `id`, `name`, `host_id`, `host_name`
- `neighbourhood_group`, `neighbourhood`, `latitude`, `longitude`
- `room_type`, `price`, `minimum_nights`
- `number_of_reviews`, `last_review`, `reviews_per_month`
- `calculated_host_listings_count`, `availability_365`
- `number_of_reviews_ltm`, `license`

Files in the project:

- `listings_melbourne.csv`
- `listings_sydney.csv`
- `listings_brisbane.csv`
- `listings_barossa.csv`

## Architecture

- **data.js**
  - Reads all `listings_*.csv` files at startup.
  - Infers the `state` for each row from the filename (VIC, NSW, QLD, SA).
  - Stores all listings in memory for fast API responses.
  - Implements `getFilteredListings` with premium ranking.

- **app.js**
  - Express server exposing:
    - `GET /` – simple landing message.
    - `GET /listings` – main API for premium listings.

- **cli.js**
  - Node CLI menu to:
    - Select a state (VIC, NSW, QLD, SA, combo, or all states).
    - Display the corresponding API URL.
    - Show how many total listings exist in that state vs. how many premium listings are returned.

## Premium Ranking Logic

Airbnb’s search algorithm rewards **quality, popularity, and recent performance** rather than raw review counts. [web:19][web:22][web:26]  
This project implements a **custom premium score** using only your available columns:

- `number_of_reviews` – long-term popularity  
- `number_of_reviews_ltm` – performance in the last 12 months  
- `reviews_per_month` – current booking momentum  

For each listing, a **premiumScore** is computed as:

- Log-scaled **total reviews** (diminishing returns):  
  - `log(number_of_reviews + 1) × 10` [web:19][web:26]
- **Last-12-month reviews** (recent performance):  
  - `number_of_reviews_ltm × 0.5` [web:21][web:29]
- **Reviews per month** (steady demand):  
  - `reviews_per_month × 2` [web:22][web:24]
- **Consistency bonus** (enough reviews to be reliable):  
  - `min(number_of_reviews ÷ 30, 10)` [web:21][web:29]

Flow:

1. Filter listings to the requested state(s) (if `stateToggle=on`).
2. Compute `premiumScore` for each listing.
3. Sort in **descending** order of `premiumScore`.
4. Return the **top 20** listings.
