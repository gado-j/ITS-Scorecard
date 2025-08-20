import os
import pandas as pd

# Constants
SCORECARD_DIR = "C:\\Windows\\System32\\scorecard\\scorecard_backend\\data\\states"

ITS_METRICS = [
    {"keywords": ["camera", "sensors", "lidar", "radar"], "weight": 0.2},
    {"keywords": ["signal", "management", "traffic light", "actuated"], "weight": 0.2},
    {"keywords": ["C-V2X", "5G", "fiber", "cellular"], "weight": 0.2},
    {"keywords": ["real-time", "information", "archived", "display"], "weight": 0.2},
    {"keywords": ["emergency", "incident", "response", "first responder"], "weight": 0.2},
]

GRADE_SCALE = {
    "A": (90, 100),
    "B": (80, 89),
    "C": (70, 79),
    "D": (60, 69),
    "E": (0, 59)
}


def grade_score(score):
    for grade, (low, high) in GRADE_SCALE.items():
        if low <= score <= high:
            return grade
    return "E"


def analyze_state(filepath):
    df = pd.read_excel(filepath)
    text_data = df.astype(str).apply(lambda x: ' '.join(x), axis=1).str.lower().str.cat(sep=' ')

    score = 0
    details = []

    for metric in ITS_METRICS:
        found = any(keyword in text_data for keyword in metric["keywords"])
        metric_result = {
            "keywords": metric["keywords"],
            "weight": metric["weight"],
            "matched": found
        }
        if found:
            score += metric["weight"] * 100
        details.append(metric_result)

    final_score = round(score, 2)
    grade = grade_score(final_score)

    return {
        "score": final_score,
        "grade": grade,
        "details": details
    }
