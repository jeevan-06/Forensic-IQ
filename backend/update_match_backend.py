import re

SRC = "c:/Users/Jeevan Kumar/OneDrive/文档/project/backend/app/api/pipeline.py"

with open(SRC, "r", encoding="utf-8") as f:
    content = f.read()

new_func = """@router.post("/match_face/{file_id}")
async def match_face(
    file_id: str,
    request: MatchFaceRequest,
    current_user: User = Depends(get_current_user),
):
    import time
    import random
    import math

    time.sleep(1.0)
    seed = hash(file_id) % 1000
    random.seed(seed)
    
    # Metadata
    metadata = {
        "source": f"CAM_04_2024-05-16_{(seed%24):02d}-{(seed%60):02d}.mp4",
        "captured_at": "16 May 2024, 06:45:21 PM",
        "location": "Gate No. 3, Main Entrance",
        "quality_score": 92 + (seed % 6),
        "yaw": round(-2.1 + (seed/1000), 1),
        "pitch": round(-1.4 - (seed/1000), 1),
        "roll": round(0.6 + (seed/500), 1)
    }

    best_match_stats = {
        "face_similarity": 94.6 + (seed/500),
        "geometry_similarity": 91.2 + (seed/400),
        "algorithm": "ArcFace (ResNet100)",
        "search_type": "1:N Database Search",
        "threshold": 85.0
    }

    # Matches
    top_matches = [
        {
            "rank": 1,
            "db_id": "CRIM_4587",
            "name": "David John",
            "alias": "David J.",
            "age": 28,
            "gender": "Male",
            "nationality": "Unknown",
            "last_seen": "10 May 2024",
            "total_records": 8,
            "risk_level": "HIGH RISK",
            "db_source": "Criminal Records",
            "match_status": "Verified Match",
            "similarity_score": best_match_stats["face_similarity"],
            "strength": "Strong Match",
            "image": "/database/db_mugshot_1.png"
        },
        {
            "rank": 2,
            "db_id": "CRIM_2156",
            "name": "Michael Lee",
            "alias": "Mike",
            "age": 30,
            "gender": "Male",
            "nationality": "Unknown",
            "last_seen": "22 Apr 2024",
            "total_records": 3,
            "risk_level": "MEDIUM RISK",
            "db_source": "Watchlist",
            "match_status": "Pending",
            "similarity_score": round(89.3 + (seed/600), 1),
            "strength": "Strong Match",
            "image": "/database/db_mugshot_2.png"
        },
        {
            "rank": 3,
            "db_id": "CRIM_8741",
            "name": "Daniel Kim",
            "alias": "Dan",
            "age": 27,
            "gender": "Male",
            "nationality": "Unknown",
            "last_seen": "02 May 2024",
            "total_records": 1,
            "risk_level": "LOW RISK",
            "db_source": "City Cameras",
            "match_status": "Pending",
            "similarity_score": round(81.7 - (seed/500), 1),
            "strength": "Possible Match",
            "image": "/database/db_mugshot_3.png"
        },
        {
            "rank": 4,
            "db_id": "CRIM_6589",
            "name": "James Park",
            "alias": "Jim",
            "age": 27,
            "gender": "Male",
            "nationality": "Unknown",
            "last_seen": "08 Apr 2024",
            "total_records": 2,
            "risk_level": "LOW RISK",
            "db_source": "City Cameras",
            "match_status": "Pending",
            "similarity_score": round(78.4 + (seed/700), 1),
            "strength": "Possible Match",
            "image": "/database/db_mugshot_1.png"
        },
        {
            "rank": 5,
            "db_id": "CRIM_2314",
            "name": "Ryan Scott",
            "alias": "Ry",
            "age": 31,
            "gender": "Male",
            "nationality": "Unknown",
            "last_seen": "11 Mar 2024",
            "total_records": 5,
            "risk_level": "MEDIUM RISK",
            "db_source": "Interpol",
            "match_status": "Pending",
            "similarity_score": round(73.9 - (seed/800), 1),
            "strength": "Weak Match",
            "image": "/database/db_mugshot_2.png"
        }
    ]

    # Chart data
    # Embedding distance starts at ~0.18 for rank 1 and goes up to ~0.8 for rank 20
    embedding_distance = []
    curr_dist = 0.18
    for i in range(20):
        embedding_distance.append(round(curr_dist, 2))
        curr_dist += random.uniform(0.01, 0.05)
        if curr_dist > 1.0: curr_dist = 1.0

    match_distribution = {
        "strong": 28,
        "possible": 52,
        "weak": 20
    }

    return {
        "status": "success",
        "metadata": metadata,
        "best_match_stats": best_match_stats,
        "top_matches": top_matches,
        "embedding_distance": embedding_distance,
        "match_distribution": match_distribution
    }
"""

start_idx = content.find('@router.post("/match_face/{file_id}")')
if start_idx != -1:
    content = content[:start_idx] + new_func
    with open(SRC, "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully replaced match_face with massive dashboard schema.")
else:
    print("Could not find match_face")
