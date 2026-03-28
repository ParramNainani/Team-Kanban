import json
import os

def score_scheme(scheme):
    """
    Scores a single scheme dictionary and returns:
    score, verified, confidence_level, notes
    """
    score = 0
    notes = []

    # A. Description Quality
    desc = scheme.get('rawDescription', '')
    if isinstance(desc, str) and len(desc.strip()) > 200:
        score += 1
        notes.append("Good description")
    else:
        notes.append("Short or missing description")

    # B. Important Info Quality
    imp_info = scheme.get('importantInfo', '')
    if isinstance(imp_info, str):
        imp_lower = imp_info.lower()
        if 'eligibility' in imp_lower and 'apply' in imp_lower and 'deadline' in imp_lower:
            score += 1
            notes.append("Valid important info")
        else:
            notes.append("Incomplete important info")
    else:
        notes.append("Missing important info")

    # C. Links Quality
    links = scheme.get('links', [])
    if isinstance(links, list) and len(links) > 0:
        has_official = any(isinstance(l, str) and ('.gov' in l.lower() or '.nic' in l.lower()) for l in links)
        if has_official:
            score += 1
            notes.append("Valid official link")
        else:
            notes.append("No official gov/nic link")
    else:
        notes.append("Missing links")

    # D. Name Quality
    name = scheme.get('name', '')
    if isinstance(name, str):
        clean_name = name.strip().lower()
        if len(clean_name) > 5 and clean_name not in ['scheme', 'yojana', 'program', 'programmes', 'mission']:
            score += 1
            notes.append("Good name")
        else:
            notes.append("Generic or short name")
    else:
        notes.append("Missing name")

    verified = bool(score >= 3)
    
    if score == 4:
        confidence_level = "high"
    elif score == 3:
        confidence_level = "medium"
    else:
        confidence_level = "low"

    return score, verified, confidence_level, notes

def verify_schemes(schemes):
    """
    Takes a list of scheme dicts, scores them, and adds metrics.
    Returns: list of updated schemes, total count, verified count.
    """
    total_schemes = 0
    verified_count = 0
    updated_schemes = []

    for scheme in schemes:
        try:
            if not isinstance(scheme, dict):
                continue
            
            total_schemes += 1
            score, verified, confidence_level, notes = score_scheme(scheme)
            
            scheme['confidenceScore'] = score
            scheme['verified'] = verified
            scheme['confidenceLevel'] = confidence_level
            scheme['verificationNotes'] = notes

            if verified:
                verified_count += 1
                
            updated_schemes.append(scheme)
        except Exception as e:
            continue

    return updated_schemes, total_schemes, verified_count

def run_verification_pipeline(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"[ERROR] Input file not found: {input_path}")
        return

    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            schemes = json.load(f)
    except Exception as e:
        print(f"[ERROR] Failed to load JSON: {e}")
        return

    if not isinstance(schemes, list):
        print("[ERROR] JSON data is not a list of schemes.")
        return

    updated_schemes, total_schemes, verified_count = verify_schemes(schemes)
    low_quality = total_schemes - verified_count

    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(updated_schemes, f, indent=2, ensure_ascii=False)
        
        print("=== Verification Summary ===")
        print(f"Total schemes evaluated: {total_schemes}")
        print(f"Verified schemes       : {verified_count}")
        print(f"Low-quality schemes    : {low_quality}")
        print("-" * 30)
        print(f"Verified: {verified_count} / {total_schemes} schemes")
        print(f"Saved to: {output_path}")
        
    except Exception as e:
        print(f"[ERROR] Failed to save verified JSON: {e}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(os.path.dirname(base_dir), 'data')
    in_file = os.path.join(data_dir, 'schemes.json')
    out_file = os.path.join(data_dir, 'schemes_verified.json')
    run_verification_pipeline(in_file, out_file)
