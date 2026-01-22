#!/usr/bin/env python3
"""
CC-CEDICT Parser
Converts CC-CEDICT format to JSON optimized for pinyin search.
Creates a dictionary indexed by pinyin (with and without tones) for fast lookup.
"""

import json
import re
from collections import defaultdict

def parse_line(line):
    """Parse a single CC-CEDICT line into a dictionary."""
    # Skip comments and empty lines
    if line.startswith('#') or not line.strip():
        return None

    # Format: Traditional Simplified [pinyin] /definition1/definition2/
    # Example: 果汁 果汁 [guo3 zhi1] /fruit juice/

    try:
        # Split on '[' to separate characters from pinyin+definitions
        char_part, rest = line.split('[', 1)

        # Split characters part (traditional and simplified)
        chars = char_part.strip().split()
        if len(chars) < 2:
            return None
        traditional = chars[0]
        simplified = chars[1]

        # Split on ']' to separate pinyin from definitions
        pinyin_part, def_part = rest.split(']', 1)
        pinyin = pinyin_part.strip()

        # Extract definitions (remove leading/trailing slashes and split)
        definitions = [d.strip() for d in def_part.strip().split('/') if d.strip()]

        return {
            'traditional': traditional,
            'simplified': simplified,
            'pinyin': pinyin,
            'definitions': definitions
        }
    except Exception as e:
        # Skip malformed lines
        return None

def normalize_pinyin(pinyin):
    """
    Remove tone numbers from pinyin for tone-insensitive search.
    'guo3 zhi1' -> 'guo zhi'
    """
    return re.sub(r'[0-9]', '', pinyin)

def parse_cedict_file(input_file):
    """
    Parse CC-CEDICT file and organize by pinyin for fast lookup.
    Returns two indexes:
    - pinyin_with_tones: exact tone matching
    - pinyin_without_tones: tone-flexible matching
    """
    pinyin_with_tones = defaultdict(list)
    pinyin_without_tones = defaultdict(list)

    total_lines = 0
    parsed_entries = 0

    with open(input_file, 'r', encoding='utf-8') as f:
        for line in f:
            total_lines += 1
            entry = parse_line(line)
            if entry:
                parsed_entries += 1

                # Index by pinyin with tones (exact match)
                pinyin_tones = entry['pinyin'].lower()
                pinyin_with_tones[pinyin_tones].append(entry)

                # Index by pinyin without tones (flexible match)
                pinyin_no_tones = normalize_pinyin(pinyin_tones)
                pinyin_without_tones[pinyin_no_tones].append(entry)

    print(f"Parsed {parsed_entries} entries from {total_lines} lines")
    print(f"Unique pinyin (with tones): {len(pinyin_with_tones)}")
    print(f"Unique pinyin (without tones): {len(pinyin_without_tones)}")

    return pinyin_with_tones, pinyin_without_tones

def main():
    input_file = '/mnt/c/Users/JonathanWheeler/Downloads/cedict/cedict_ts.u8'
    output_dir = '/mnt/c/source/personal/my-page'

    print("Parsing CC-CEDICT file...")
    pinyin_with_tones, pinyin_without_tones = parse_cedict_file(input_file)

    # Save as JSON
    # Note: We'll save both indexes for flexibility
    output_data = {
        'with_tones': dict(pinyin_with_tones),
        'without_tones': dict(pinyin_without_tones)
    }

    output_file = f"{output_dir}/cedict_pinyin_index.json"
    print(f"Writing to {output_file}...")

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, separators=(',', ':'))

    # Check file size
    import os
    size_mb = os.path.getsize(output_file) / (1024 * 1024)
    print(f"Output file size: {size_mb:.2f} MB")

    # Test a few lookups
    print("\nTest lookups:")
    test_cases = ['guo3 zhi1', 'guo zhi', 'ni3 hao3', 'ni hao']
    for query in test_cases:
        if query in output_data['with_tones']:
            results = output_data['with_tones'][query]
            print(f"  '{query}' (with tones): {len(results)} results")
            if results:
                print(f"    Example: {results[0]['simplified']} = {results[0]['definitions'][0]}")
        elif query in output_data['without_tones']:
            results = output_data['without_tones'][query]
            print(f"  '{query}' (without tones): {len(results)} results")
            if results:
                print(f"    Example: {results[0]['simplified']} = {results[0]['definitions'][0]}")

if __name__ == '__main__':
    main()
