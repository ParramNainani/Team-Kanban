import requests
from bs4 import BeautifulSoup
import json
import os
import re
from urllib.parse import urljoin

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def clean_text(text):
    if not text:
        return ""
    text = re.sub(r'\[\d+\]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def clean_name(name):
    if not name:
        return ""
    name = re.sub(r'\(.*?\)', '', name)
    name = re.sub(r'\[.*?\]', '', name)
    return clean_text(name).strip()

def limit_description(desc):
    if not desc:
        return ""
    if len(desc) > 800:
        return desc[:797].rsplit(' ', 1)[0] + '...'
    return desc

def is_actual_scheme(name):
    name_lower = name.lower()
    
    includes = ['yojana', 'scheme', 'mission', 'abhiyan', 'programme']
    if not any(kw in name_lower for kw in includes):
        return False
        
    excludes = ['commission', 'organization', 'act', 'ministry']
    if any(kw in name_lower for kw in excludes):
        return False
        
    return True

def is_quality_data(name, description):
    if len(name) < 4:
        return False
    if len(description) < 30:
        return False
        
    lower_desc = description.lower()
    if 'stub' in lower_desc or 'you can help wikipedia' in lower_desc or 'please help improve this article' in lower_desc:
        return False
        
    if "wikipedia" in name.lower() or "edit" in name.lower():
        return False
        
    if not is_actual_scheme(name):
        return False
        
    return True

def fetch_detail_page(url, extract_links=False):
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        paragraphs = soup.find_all('p')
        detail_text = []
        child_links = []
        
        for p in paragraphs:
            text = clean_text(p.text)
            if len(text) > 30:
                detail_text.append(text)
                
                if extract_links and len(child_links) < 10:
                    for a in p.find_all('a', href=True):
                        href = a['href']
                        if href.startswith('/wiki/') and not ':' in href:
                            child_name = clean_name(a.text)
                            if len(child_name) > 4 and is_actual_scheme(child_name):
                                child_links.append((urljoin("https://en.wikipedia.org", href), child_name))
                                if len(child_links) >= 10:
                                    break

            if len(detail_text) >= 3:
                break
                
        return limit_description(" ".join(detail_text).strip()), child_links
    except Exception as e:
        return "", []

def scrape_wikipedia():
    print("Fetching from Wikipedia...")
    url = "https://en.wikipedia.org/wiki/List_of_government_schemes_in_India"
    schemes = []
    links_followed = 0
    max_wiki_links = 60
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        tables = soup.find_all('table', class_='wikitable')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows[1:]:
                cols = row.find_all(['td', 'th'])
                if len(cols) < 2:
                    continue

                name_col = cols[0]
                name = clean_name(name_col.text)

                desc_col = cols[-1]
                description = limit_description(clean_text(desc_col.text))

                if len(name) < 4:
                    continue

                link_elem = name_col.find('a')
                child_links_to_visit = []
                
                if link_elem and link_elem.has_attr('href') and links_followed < max_wiki_links:
                    href = link_elem['href']
                    if href.startswith('/wiki/'):
                        full_url = urljoin("https://en.wikipedia.org", href)
                        print(f"Following Wikipedia link: {full_url}")
                        detail_desc, c_links = fetch_detail_page(full_url, extract_links=True)
                        if detail_desc and len(detail_desc) > len(description):
                            description = detail_desc
                        
                        child_links_to_visit = c_links
                        links_followed += 1

                if is_quality_data(name, description):
                    schemes.append({
                        "name": name,
                        "rawDescription": description,
                        "source": "wikipedia"
                    })
                
                # Second-level crawling
                for child_url, child_name in child_links_to_visit:
                    if links_followed < max_wiki_links:
                        print(f"Following nested link: {child_url}")
                        c_desc, _ = fetch_detail_page(child_url, extract_links=False)
                        links_followed += 1
                        
                        if is_quality_data(child_name, c_desc):
                            schemes.append({
                                "name": child_name,
                                "rawDescription": c_desc,
                                "source": "wikipedia-nested"
                            })

    except Exception as e:
        print(f"Error fetching from Wikipedia: {e}")

    return schemes

def scrape_india_gov():
    print("Fetching from India.gov...")
    base_url = "https://www.india.gov.in/my-government/schemes"
    schemes = []
    links_followed = 0
    max_india_links = 40

    try:
        response = requests.get(base_url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        links = soup.find_all('a')
        for link in links:
            name = clean_name(link.text)

            if name and len(name) > 10:
                if "Ministry" in name or "scheme" in name.lower() or "service" in name.lower() or "mission" in name.lower() or "yojana" in name.lower():
                    description = limit_description(clean_text(link.get('title', name)))

                    if link.has_attr('href') and links_followed < max_india_links:
                        href = link['href']
                        if href.startswith('/') or href.startswith('http'):
                            if '?' in href:
                                continue
                            full_url = urljoin("https://www.india.gov.in", href)
                            if full_url.startswith("https://www.india.gov.in"):
                                print(f"Following India.gov link: {full_url}")
                                detail_desc, _ = fetch_detail_page(full_url)
                                if detail_desc and len(detail_desc) > len(description):
                                    description = detail_desc
                                links_followed += 1

                    if len(description) < 30:
                        continue

                    if not is_quality_data(name, description):
                        continue

                    schemes.append({
                        "name": name,
                        "rawDescription": description,
                        "source": "india.gov"
                    })
    except Exception as e:
        print(f"Error fetching from India.gov: {e}")

    return schemes

def scrape_poverty_source():
    print("Fetching from Poverty in India...")
    url = "https://en.wikipedia.org/wiki/Poverty_in_India"
    schemes = []
    links_followed = 0
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        content = soup.find(id='mw-content-text')
        if not content:
            return schemes

        for li in content.find_all('li'):
            text = li.text.strip()
            
            if "Yojana" in text or "Programme" in text or "Scheme" in text or "Mission" in text:
                link_elem = li.find('a', href=True)
                name = ""
                if link_elem:
                    name = clean_name(link_elem.text)
                
                if not name or len(name) < 4:
                    name = text.split('.')[0].split('-')[0].split(':')[0][:60]
                    
                name = clean_name(name)
                description = limit_description(clean_text(text))
                
                if link_elem and link_elem['href'].startswith('/wiki/') and links_followed < 20:
                    full_url = urljoin("https://en.wikipedia.org", link_elem['href'])
                    if not ':' in full_url:
                        print(f"Following Poverty link: {full_url}")
                        detail_desc, _ = fetch_detail_page(full_url)
                        if detail_desc and len(detail_desc) > len(description):
                            description = detail_desc
                        links_followed += 1

                if not is_quality_data(name, description):
                    continue

                schemes.append({
                    "name": name,
                    "rawDescription": description,
                    "source": "wikipedia-poverty"
                })

    except Exception as e:
        print(f"Error fetching from Poverty in India: {e}")

    return schemes

def scrape_digital_source():
    print("Fetching from Digital India...")
    url = "https://en.wikipedia.org/wiki/Digital_India"
    schemes = []
    links_followed = 0
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        content = soup.find(id='mw-content-text')
        if not content:
            return schemes

        for li in content.find_all('li'):
            text = li.text.strip()
            
            if "Yojana" in text or "Programme" in text or "Scheme" in text or "Mission" in text or "Initiative" in text:
                link_elem = li.find('a', href=True)
                name = ""
                if link_elem:
                    name = clean_name(link_elem.text)
                
                if not name or len(name) < 4:
                    name = text.split('.')[0].split('-')[0].split(':')[0][:60]
                    
                name = clean_name(name)
                description = limit_description(clean_text(text))
                
                if link_elem and link_elem['href'].startswith('/wiki/') and links_followed < 20:
                    full_url = urljoin("https://en.wikipedia.org", link_elem['href'])
                    if not ':' in full_url:
                        print(f"Following Digital link: {full_url}")
                        detail_desc, _ = fetch_detail_page(full_url)
                        if detail_desc and len(detail_desc) > len(description):
                            description = detail_desc
                        links_followed += 1
                
                fname = f"Digital India: {name}"
                if not is_quality_data(fname, description):
                    continue
                    
                schemes.append({
                    "name": fname,
                    "rawDescription": description,
                    "source": "wikipedia-digital"
                })

    except Exception as e:
        print(f"Error fetching from Digital Source: {e}")

    return schemes


def main():
    wiki_schemes = scrape_wikipedia()
    india_gov_schemes = scrape_india_gov()
    poverty_schemes = scrape_poverty_source()
    digital_schemes = scrape_digital_source()

    print(f"Wiki: {len(wiki_schemes)} | India: {len(india_gov_schemes)} | Poverty: {len(poverty_schemes)} | Digital: {len(digital_schemes)}")

    print("Merging results...")
    all_schemes = wiki_schemes + india_gov_schemes + poverty_schemes + digital_schemes

    merged_dict = {}
    duplicates_removed = 0

    for item in all_schemes:
        name_lower = item['name'].lower()

        if name_lower in merged_dict:
            duplicates_removed += 1
            existing_desc_len = len(merged_dict[name_lower]['rawDescription'])
            new_desc_len = len(item['rawDescription'])

            if new_desc_len > existing_desc_len:
                merged_dict[name_lower] = item
        else:
            merged_dict[name_lower] = item

    print(f"Duplicates removed: {duplicates_removed}")

    final_schemes = []
    counter = 1

    for key, item in merged_dict.items():
        scheme_data = {
            "id": f"scheme_{counter}",
            "name": item['name'],
            "rawDescription": item['rawDescription'],
            "fullText": f"{item['name']} - {item['rawDescription']}",
            "source": item['source']
        }
        final_schemes.append(scheme_data)
        counter += 1

    print(f"Final dataset: {len(final_schemes)} schemes")

    print("Saving JSON...")
    current_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(current_dir, "schemes.json")

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(final_schemes, f, indent=2, ensure_ascii=False)
        print("Done.")
    except IOError as e:
        print(f"Error saving to JSON: {e}")

if __name__ == "__main__":
    main()
