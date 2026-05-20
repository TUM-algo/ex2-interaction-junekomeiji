#!/usr/bin/env python3
"""
Fetch ~1000 movies from TMDB and write them in the same CSV format
as netflix_votes1000.txt.

Usage:
    python fetch_tmdb.py <TMDB_API_KEY> [output_file]

Default output: data/tmdb_votes1000.txt
"""

import csv
import sys
import time
import requests

BASE = "https://api.themoviedb.org/3"
POSTER_BASE = "https://image.tmdb.org/t/p/w342"
TARGET = 1000
PER_PAGE = 20  # TMDB fixed page size


def get(path, params, api_key):
    params["api_key"] = api_key
    r = requests.get(BASE + path, params=params, timeout=10)
    r.raise_for_status()
    return r.json()


def fetch_movies(api_key):
    movies = []
    page = 1
    seen = set()

    while len(movies) < TARGET:
        data = get("/discover/movie", {
            "sort_by": "vote_average.desc",
            "vote_count.gte": 1000,  # filter out obscure films with few votes
            "include_adult": "false",
            "page": page,
        }, api_key)

        total_pages = data.get("total_pages", 1)

        for m in data["results"]:
            if m["id"] in seen:
                continue
            seen.add(m["id"])

            detail = get(f"/movie/{m['id']}", {
                "append_to_response": "credits,keywords"
            }, api_key)

            cast_list = [
                c["name"]
                for c in detail.get("credits", {}).get("cast", [])[:5]
            ]
            director_list = [
                c["name"]
                for c in detail.get("credits", {}).get("crew", [])
                if c["job"] == "Director"
            ]
            keyword_list = [
                k["name"]
                for k in detail.get("keywords", {}).get("keywords", [])[:10]
            ]
            genre_list = [g["name"] for g in detail.get("genres", [])]

            release = detail.get("release_date", "")
            year = release[:4] if release else ""

            poster = detail.get("poster_path", "")
            poster_url = (POSTER_BASE + poster) if poster else ""

            movies.append({
                "movie_id": len(movies) + 1,
                "year": year,
                "title": detail.get("title", ""),
                "tmdb_id": detail["id"],
                "tmdb_title": detail.get("title", ""),
                "original_language": detail.get("original_language", ""),
                "overview": detail.get("overview", ""),
                "tagline": detail.get("tagline", ""),
                "genres": ", ".join(genre_list),
                "cast": ", ".join(cast_list),
                "director": ", ".join(director_list),
                "keywords": ", ".join(keyword_list),
                "runtime_min": detail.get("runtime") or "",
                "tmdb_vote_average": detail.get("vote_average", ""),
                "tmdb_vote_count": detail.get("vote_count", ""),
                "popularity": detail.get("popularity", ""),
                "tmdb_release_date": release,
                "poster_path": poster_url,
            })

            if len(movies) >= TARGET:
                break

            # Stay well within TMDB's 40 req/10s rate limit
            time.sleep(0.27)

        print(f"  page {page}/{total_pages} — {len(movies)}/{TARGET} collected")

        if page >= total_pages:
            break
        page += 1

    return movies


FIELDS = [
    "movie_id", "year", "title", "tmdb_id", "tmdb_title",
    "original_language", "overview", "tagline", "genres", "cast",
    "director", "keywords", "runtime_min", "tmdb_vote_average",
    "tmdb_vote_count", "popularity", "tmdb_release_date", "poster_path",
]


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    api_key = sys.argv[1]
    out_path = sys.argv[2] if len(sys.argv) > 2 else "data/tmdb_votes1000.txt"

    print(f"Fetching {TARGET} movies from TMDB …")
    movies = fetch_movies(api_key)

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(movies)

    print(f"Done — {len(movies)} movies written to {out_path}")


if __name__ == "__main__":
    main()
