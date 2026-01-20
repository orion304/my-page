#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Convert Zhuyin (Bopomofo) to IPA based on Wikipedia reference tables.

This script uses the authoritative IPA mappings from Wikipedia's Bopomofo article
to convert Zhuyin syllables to IPA notation with tone numbers (1-4, neutral=5).

Usage:
    python zhuyin_to_ipa.py "ㄋㄧˇ ㄏㄠˇ"  # Single conversion
    python zhuyin_to_ipa.py --update-dict    # Update chinese_dictionary.json
"""

import json
import re
import sys
import io

# Ensure UTF-8 output on Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Tone marks to tone numbers mapping
TONE_MARKS = {
    '': '1',      # First tone (unmarked or ˉ)
    'ˉ': '1',     # First tone (alternative mark)
    'ˊ': '2',     # Second tone
    'ˇ': '3',     # Third tone
    'ˋ': '4',     # Fourth tone
    '˙': '5',     # Neutral tone (or 0)
}

# Consonants (initials) mapping
INITIALS = {
    'ㄅ': 'p',
    'ㄆ': 'pʰ',
    'ㄇ': 'm',
    'ㄈ': 'f',
    'ㄉ': 't',
    'ㄊ': 'tʰ',
    'ㄋ': 'n',
    'ㄌ': 'l',
    'ㄍ': 'k',
    'ㄎ': 'kʰ',
    'ㄏ': 'x',     # Using x (velar) as default over h (glottal)
    'ㄐ': 'tɕ',
    'ㄑ': 'tɕʰ',
    'ㄒ': 'ɕ',
    'ㄓ': 'ʈʂ',
    'ㄔ': 'ʈʂʰ',
    'ㄕ': 'ʂ',
    'ㄖ': 'ɻ',     # Using approximant as default
    'ㄗ': 'ts',
    'ㄘ': 'tsʰ',
    'ㄙ': 's',
}

# Finals (rhymes) mapping - no medial
FINALS_SIMPLE = {
    'ㄚ': 'a',
    'ㄛ': 'o',
    'ㄜ': 'ɤ',
    'ㄝ': 'ɛ',
    'ㄞ': 'ai',
    'ㄟ': 'ei',
    'ㄠ': 'ɑu',
    'ㄡ': 'ou',
    'ㄢ': 'an',
    'ㄣ': 'ən',
    'ㄤ': 'ɑŋ',
    'ㄥ': 'ɤŋ',
    'ㄦ': 'aɚ',
    'ㄭ': 'ɨ',     # Apical vowel (after sibilants)
}

# Finals with medial ㄧ (i)
FINALS_I = {
    'ㄧ': 'i',
    'ㄧㄚ': 'ia',
    'ㄧㄛ': 'io',
    'ㄧㄝ': 'iɛ',
    'ㄧㄞ': 'iai',
    'ㄧㄠ': 'iɑu',
    'ㄧㄡ': 'iou',
    'ㄧㄢ': 'iɛn',
    'ㄧㄣ': 'in',
    'ㄧㄤ': 'iɑŋ',
    'ㄧㄥ': 'iŋ',
}

# Finals with medial ㄨ (u)
FINALS_U = {
    'ㄨ': 'u',
    'ㄨㄚ': 'ua',
    'ㄨㄛ': 'uo',
    'ㄨㄞ': 'uai',
    'ㄨㄟ': 'uei',
    'ㄨㄢ': 'uan',
    'ㄨㄣ': 'uən',
    'ㄨㄤ': 'uɑŋ',
    'ㄨㄥ': 'uɤŋ',  # Can also be ʊŋ
}

# Finals with medial ㄩ (ü)
FINALS_Y = {
    'ㄩ': 'y',
    'ㄩㄝ': 'yɛ',
    'ㄩㄢ': 'yɛn',
    'ㄩㄣ': 'yn',
    'ㄩㄥ': 'iʊŋ',
}

# Combine all finals
ALL_FINALS = {**FINALS_SIMPLE, **FINALS_I, **FINALS_U, **FINALS_Y}


def extract_tone(zhuyin_syllable):
    """Extract tone mark from Zhuyin syllable and return (syllable_without_tone, tone_number)."""
    for mark, number in TONE_MARKS.items():
        if mark and zhuyin_syllable.endswith(mark):
            return zhuyin_syllable[:-1], number
    # No tone mark found = first tone
    return zhuyin_syllable, '1'


def convert_zhuyin_syllable(zhuyin_syllable):
    """Convert a single Zhuyin syllable to IPA with tone number."""
    if not zhuyin_syllable.strip():
        return ''

    # Extract tone
    syllable_no_tone, tone = extract_tone(zhuyin_syllable.strip())

    # Try to match as a complete syllable (for standalone finals)
    if syllable_no_tone in ALL_FINALS:
        ipa = ALL_FINALS[syllable_no_tone]
        return f'{ipa}{tone}'

    # Try to split into initial + final
    for i in range(len(syllable_no_tone), 0, -1):
        potential_initial = syllable_no_tone[:i]
        potential_final = syllable_no_tone[i:]

        if potential_initial in INITIALS:
            initial_ipa = INITIALS[potential_initial]

            # Handle special case: ㄓㄔㄕㄖㄗㄘㄙ can stand alone (with apical vowel ɨ)
            if not potential_final:
                if potential_initial in ['ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ']:
                    return f'{initial_ipa}ɨ{tone}'
                else:
                    # Initial without final is invalid
                    return f'[ERROR: {zhuyin_syllable}]'

            # Try to find final
            if potential_final in ALL_FINALS:
                final_ipa = ALL_FINALS[potential_final]
                return f'{initial_ipa}{final_ipa}{tone}'

    # Could not parse
    return f'[ERROR: {zhuyin_syllable}]'


def convert_zhuyin_to_ipa(zhuyin_text):
    """Convert a string of Zhuyin text to IPA with tone numbers."""
    # Split on whitespace
    syllables = zhuyin_text.strip().split()
    ipa_syllables = [convert_zhuyin_syllable(syl) for syl in syllables]

    # Join with spaces and wrap in slashes
    ipa = ' '.join(ipa_syllables)
    return f'/{ipa}/'


def update_dictionary():
    """Update chinese_dictionary.json with IPA transcriptions from Zhuyin."""
    dict_path = 'chinese_dictionary.json'

    try:
        with open(dict_path, 'r', encoding='utf-8') as f:
            dictionary = json.load(f)
    except FileNotFoundError:
        print(f"Error: {dict_path} not found")
        return

    updated = 0
    for word_key, word_data in dictionary.items():
        if 'zhuyin' in word_data:
            zhuyin = word_data['zhuyin']
            ipa = convert_zhuyin_to_ipa(zhuyin)
            word_data['ipa'] = ipa
            updated += 1
            print(f"{word_key}: {zhuyin} → {ipa}")

    # Write back to file
    with open(dict_path, 'w', encoding='utf-8') as f:
        json.dump(dictionary, f, ensure_ascii=False, indent=2)

    print(f"\nUpdated {updated} entries in {dict_path}")


if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == '--update-dict':
            update_dictionary()
        elif sys.argv[1] in ['-h', '--help']:
            print(__doc__)
        else:
            # Convert provided Zhuyin text
            zhuyin = ' '.join(sys.argv[1:])
            ipa = convert_zhuyin_to_ipa(zhuyin)
            print(f"{zhuyin} → {ipa}")
    else:
        # Interactive mode
        print("Zhuyin to IPA Converter")
        print("Enter Zhuyin text (or 'quit' to exit):")
        while True:
            zhuyin = input("> ").strip()
            if zhuyin.lower() in ['quit', 'exit', 'q']:
                break
            if zhuyin:
                ipa = convert_zhuyin_to_ipa(zhuyin)
                print(f"  → {ipa}")
