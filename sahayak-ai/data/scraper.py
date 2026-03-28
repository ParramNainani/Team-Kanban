import requests
from bs4 import BeautifulSoup
import json
import os
import re
from urllib.parse import urljoin, urlparse, quote
from concurrent.futures import ThreadPoolExecutor, as_completed

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

visited_urls = set()
MAX_SCHEMES = 160

def safe_request(url):
    if url in visited_urls:
        print(f"[SKIPPED] Already visited: {url}")
        return None
    visited_urls.add(url)
    print(f"[FETCHING] {url}")
    try:
        response = requests.get(url, headers=HEADERS, timeout=5)
        response.raise_for_status()
        return response
    except Exception as e:
        print(f"[ERROR] Failed to fetch {url}: {e}")
        return None

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
    return desc

def is_actual_scheme(name):
    name_lower = name.lower()
    
    includes = ['yojana', 'scheme', 'mission', 'abhiyan']
    has_inc = any(kw in name_lower for kw in includes)
    
    has_prog = any(kw in name_lower for kw in ['program', 'initiative', 'programme'])
    has_gov = any(kw in name_lower for kw in ['india', 'government'])
    
    if not has_inc and not (has_prog and has_gov):
        return False
        
    excludes = ['commission', 'organization', 'act', 'ministry', 'world', 'international', 'united nations']
    if any(kw in name_lower for kw in excludes):
        return False
        
    return True

def is_quality_data(name, description):
    if len(name) < 4:
        return False
    if len(description) < 15:
        return False
        
    lower_desc = description.lower()
    if 'stub' in lower_desc or 'you can help wikipedia' in lower_desc or 'please help improve this article' in lower_desc:
        return False
        
    if "wikipedia" in name.lower() or "edit" in name.lower():
        return False
        
    if not is_actual_scheme(name):
        return False
        
    return True

def fetch_detail_page(url, extract_links=False, scheme_name=""):
    desc_keywords = ["benefit", "eligibility", "income", "subsidy", "scheme"]
    imp_keywords = ["apply", "how to apply", "eligibility", "deadline", "last date", "who can apply", "registration"]
    try:
        response = safe_request(url)
        if not response:
            return {
                "description": "",
                "important": "Eligibility: Check official website. Apply: Visit official portal. Deadline: Varies by scheme.",
                "links": []
            }, []
        soup = BeautifulSoup(response.content, 'html.parser')
        
        paragraphs = soup.find_all('p')
        all_valid_texts = []
        child_links = []
        useful_links = []
        
        # 1. Look for External links
        sections = soup.find_all(['h2', 'h3'])
        for section in sections:
            sect_text = section.text.lower()
            if 'external links' in sect_text or 'official website' in sect_text or 'official link' in sect_text:
                ul = section.find_next_sibling('ul')
                if ul:
                    for a in ul.find_all('a', href=True):
                        try:
                            full_url = urljoin(url, a['href'])
                            domain = urlparse(full_url).netloc.lower()
                            if domain.endswith('.gov.in') or domain.endswith('.nic.in') or 'myscheme.gov.in' in full_url.lower():
                                if full_url.startswith('http') and full_url not in useful_links:
                                    useful_links.append(full_url)
                                    if len(useful_links) >= 3: break
                        except Exception:
                            pass
            if len(useful_links) >= 3: break
            
        # 2. Check all ancher tags if needed
        if len(useful_links) < 3:
            all_a_tags = soup.find_all('a', href=True)
            for a in all_a_tags:
                href = a['href']
                text_lower = a.text.lower()
                href_lower = href.lower()
                
                # Remove useless links
                bad_kws = ["wikipedia", "archive", "template", "news"]
                if any(bad in href_lower for bad in bad_kws) or any(bad in text_lower for bad in bad_kws):
                    continue
                    
                # Keep only useful links
                try:
                    full_url = urljoin(url, href)
                    domain = urlparse(full_url).netloc.lower()
                    
                    # Check for .gov.in, .nic.in at the end of domain, OR myscheme anywhere
                    if domain.endswith('.gov.in') or domain.endswith('.nic.in') or 'myscheme.gov.in' in full_url.lower():
                        if full_url.startswith('http') and full_url not in useful_links:
                            useful_links.append(full_url)
                            if len(useful_links) >= 3:
                                break
                except Exception:
                    continue
                    
        # 3. Fallback
        if not useful_links and scheme_name:
            useful_links.append(f"https://www.myscheme.gov.in/search?q={quote(scheme_name)}")
        
        for p in paragraphs:
            text = clean_text(p.text)
            if len(text) > 30:
                all_valid_texts.append(text)
                
                if extract_links and len(child_links) < 20:
                    for a in p.find_all('a', href=True):
                        href = a['href']
                        if href.startswith('/wiki/') and not ':' in href:
                            child_name = clean_name(a.text)
                            if len(child_name) > 4 and is_actual_scheme(child_name):
                                child_links.append((urljoin("https://en.wikipedia.org", href), child_name))
                                if len(child_links) >= 20:
                                    break

        priority_texts = []
        eligibility_sents = []
        apply_sents = []
        deadline_sents = []
        
        for text in all_valid_texts:
            text_lower = text.lower()
            if any(kw in text_lower for kw in desc_keywords):
                priority_texts.append(text)
            
            sentences = re.split(r'(?<=[.!?])\s+', text)
            for sentence in sentences:
                sent_lower = sentence.lower()
                clean_sent = sentence.strip()
                
                if "eligibility" in sent_lower or "who can apply" in sent_lower:
                    if clean_sent not in eligibility_sents:
                        eligibility_sents.append(clean_sent)
                elif "apply" in sent_lower or "registration" in sent_lower:
                    if clean_sent not in apply_sents:
                        apply_sents.append(clean_sent)
                elif "deadline" in sent_lower or "last date" in sent_lower:
                    if clean_sent not in deadline_sents:
                        deadline_sents.append(clean_sent)

        if priority_texts:
            final_texts = priority_texts[:10]
        else:
            final_texts = all_valid_texts[:10]
            
        description_text = " ".join(final_texts).strip()
        
        eligibility_text = " ".join(eligibility_sents[:2]).strip() if eligibility_sents else "Check official website."
        apply_text = " ".join(apply_sents[:2]).strip() if apply_sents else "Check official website."
        deadline_text = " ".join(deadline_sents[:2]).strip() if deadline_sents else "Check official website."
        
        important_text = f"Eligibility: {eligibility_text} Apply: {apply_text} Deadline: {deadline_text}"
        
        # Fallback for important info length requirement
        if len(important_text) < 50:
            important_text = "Eligibility: Check official website. Apply: Visit official portal. Deadline: Varies by scheme."
                
        return {
            "description": description_text,
            "important": important_text,
            "links": useful_links
        }, child_links
    except Exception as e:
        return {
            "description": "",
            "important": "Eligibility: Check official website. Apply: Visit official portal. Deadline: Varies by scheme.",
            "links": []
        }, []

def scrape_wikipedia():
    print("Fetching from Wikipedia...")
    url = "https://en.wikipedia.org/wiki/List_of_government_schemes_in_India"
    schemes = []
    links_followed = 0
    max_wiki_links = 120
    
    try:
        response = safe_request(url)
        if not response: return schemes
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
                important = ""
                links = []
                
                if link_elem and link_elem.has_attr('href') and links_followed < max_wiki_links:
                    href = link_elem['href']
                    if href.startswith('/wiki/'):
                        full_url = urljoin("https://en.wikipedia.org", href)
                        print(f"Following Wikipedia link: {full_url}")
                        detail_data, c_links = fetch_detail_page(full_url, extract_links=True, scheme_name=name)
                        if detail_data.get("description") and len(detail_data["description"]) > len(description):
                            description = detail_data["description"]
                        important = detail_data.get("important", "")
                        links = detail_data.get("links", [])
                        
                        child_links_to_visit = c_links
                        links_followed += 1

                if is_quality_data(name, description):
                    schemes.append({
                        "name": name,
                        "rawDescription": description,
                        "important": important,
                        "links": links,
                        "source": "wikipedia"
                    })
                
                # Second-level crawling
                for child_url, child_name in child_links_to_visit:
                    if links_followed < max_wiki_links:
                        print(f"Following nested link: {child_url}")
                        detail_data, _ = fetch_detail_page(child_url, extract_links=False, scheme_name=child_name)
                        links_followed += 1
                        
                        c_desc = detail_data.get("description", "")
                        if is_quality_data(child_name, c_desc):
                            schemes.append({
                                "name": child_name,
                                "rawDescription": c_desc,
                                "important": detail_data.get("important", ""),
                                "links": detail_data.get("links", []),
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
    max_india_links = 100

    try:
        response = safe_request(base_url)
        if not response: return schemes
        soup = BeautifulSoup(response.content, 'html.parser')

        links = soup.find_all('a')
        for link in links:
            name = clean_name(link.text)

            if name and len(name) > 10:
                if "Ministry" in name or "scheme" in name.lower() or "service" in name.lower() or "mission" in name.lower() or "yojana" in name.lower():
                    description = limit_description(clean_text(link.get('title', name)))
                    important = ""
                    scheme_links = []

                    if link.has_attr('href') and links_followed < max_india_links:
                        href = link['href']
                        if href.startswith('/') or href.startswith('http'):
                            if '?' in href:
                                continue
                            full_url = urljoin("https://www.india.gov.in", href)
                            if full_url.startswith("https://www.india.gov.in"):
                                print(f"Following India.gov link: {full_url}")
                                detail_data, _ = fetch_detail_page(full_url, scheme_name=name)
                                if detail_data.get("description") and len(detail_data["description"]) > len(description):
                                    description = detail_data["description"]
                                important = detail_data.get("important", "")
                                scheme_links = detail_data.get("links", [])
                                links_followed += 1

                    if len(description) < 30:
                        continue

                    if not is_quality_data(name, description):
                        continue

                    schemes.append({
                        "name": name,
                        "rawDescription": description,
                        "important": important,
                        "links": scheme_links,
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
        response = safe_request(url)
        if not response: return schemes
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
                important = ""
                scheme_links = []
                
                if link_elem and link_elem['href'].startswith('/wiki/') and links_followed < 20:
                    full_url = urljoin("https://en.wikipedia.org", link_elem['href'])
                    if not ':' in full_url:
                        print(f"Following Poverty link: {full_url}")
                        detail_data, _ = fetch_detail_page(full_url, scheme_name=name)
                        if detail_data.get("description") and len(detail_data["description"]) > len(description):
                            description = detail_data["description"]
                        important = detail_data.get("important", "")
                        scheme_links = detail_data.get("links", [])
                        links_followed += 1

                if not is_quality_data(name, description):
                    continue

                schemes.append({
                    "name": name,
                    "rawDescription": description,
                    "important": important,
                    "links": scheme_links,
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
        response = safe_request(url)
        if not response: return schemes
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
                important = ""
                scheme_links = []
                
                if link_elem and link_elem['href'].startswith('/wiki/') and links_followed < 20:
                    full_url = urljoin("https://en.wikipedia.org", link_elem['href'])
                    if not ':' in full_url:
                        print(f"Following Digital link: {full_url}")
                        detail_data, _ = fetch_detail_page(full_url, scheme_name=name)
                        if detail_data.get("description") and len(detail_data["description"]) > len(description):
                            description = detail_data["description"]
                        important = detail_data.get("important", "")
                        scheme_links = detail_data.get("links", [])
                        links_followed += 1
                
                fname = f"Digital India: {name}"
                if not is_quality_data(fname, description):
                    continue
                    
                schemes.append({
                    "name": fname,
                    "rawDescription": description,
                    "important": important,
                    "links": scheme_links,
                    "source": "wikipedia-digital"
                })

    except Exception as e:
        print(f"Error fetching from Digital Source: {e}")

    return schemes

def scrape_wiki_category():
    print("Fetching from Wikipedia Categories...")
    base_urls = [
        "https://en.wikipedia.org/wiki/Category:Government_schemes_in_India",
        "https://en.wikipedia.org/wiki/Category:Social_programs_in_India"
    ]
    schemes = []
    links_followed = 0
    max_links = 200
    
    for url in base_urls:
        pages_crawled = 0
        while url and pages_crawled < 3:
            try:
                response = safe_request(url)
                if not response: break
                soup = BeautifulSoup(response.content, 'html.parser')
                pages_crawled += 1
                print(f"Crawled Category page: {url}")
                
                category_groups = soup.find_all('div', class_='mw-category-group')
                for group in category_groups:
                    links = group.find_all('a')
                    for link in links:
                        if links_followed >= max_links:
                            break
                            
                        name = clean_name(link.text)
                        if not is_actual_scheme(name):
                            continue
                            
                        href = link.get('href')
                        if not href or not href.startswith('/wiki/'):
                            continue
                            
                        full_url = urljoin("https://en.wikipedia.org", href)
                        print(f"Following Wiki Category link: {full_url}")
                        detail_data, _ = fetch_detail_page(full_url, extract_links=False, scheme_name=name)
                        links_followed += 1
                        
                        description = detail_data.get("description", "")
                        if is_quality_data(name, description):
                            schemes.append({
                                "name": name,
                                "rawDescription": description,
                                "important": detail_data.get("important", ""),
                                "links": detail_data.get("links", []),
                                "source": "wikipedia-category"
                            })
                            
                # Check for next page
                next_link = None
                for a in soup.find_all('a'):
                    if a.text == 'next page':
                        next_link = urljoin("https://en.wikipedia.org", a['href'])
                        break
                
                url = next_link
                if links_followed >= max_links:
                    break
            except Exception as e:
                print(f"Error fetching from Wikipedia Category {url}: {e}")
                break
        
    return schemes

def scrape_latest_schemes():
    print("Fetching from MyScheme...")
    url = "https://www.myscheme.gov.in/search"
    schemes = []
    try:
        response = safe_request(url)
        if not response: return schemes
        soup = BeautifulSoup(response.content, 'html.parser')
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            if '/schemes/' in href:
                name = clean_name(link.text)
                if name and is_actual_scheme(name):
                    full_url = urljoin("https://www.myscheme.gov.in", href)
                    print(f"Following MyScheme link: {full_url}")
                    
                    detail_data, _ = fetch_detail_page(full_url, extract_links=False, scheme_name=name)
                    description = detail_data.get("description", "")
                    important = detail_data.get("important", "")
                    
                    if not description:
                        description = f"Official scheme details available at {full_url}"
                    if not important:
                        important = "Eligibility: Check official website. Apply: Visit official portal. Deadline: Varies by scheme."
                        
                    if len(name) >= 4 and len(description) >= 30:
                        if is_actual_scheme(name) and is_quality_data(name, description):
                            schemes.append({
                                "name": name,
                                "rawDescription": description,
                                "important": important,
                                "links": [full_url] + detail_data.get("links", []),
                                "source": "myscheme"
                            })
                            if len(schemes) >= 25:
                                break
    except Exception as e:
        print(f"Error fetching from MyScheme: {e}")
        
    return schemes

def main():
    max_total_schemes = MAX_SCHEMES
    all_schemes = []

    scrape_funcs = [
        scrape_latest_schemes,
        scrape_wikipedia,
        scrape_india_gov,
        scrape_poverty_source,
        scrape_digital_source,
        scrape_wiki_category
    ]

    print("\n--- Running scrapers concurrently ---")
    try:
        with ThreadPoolExecutor(max_workers=6) as executor:
            future_to_func = {executor.submit(func): func.__name__ for func in scrape_funcs}
            for future in as_completed(future_to_func):
                func_name = future_to_func[future]
                try:
                    new_schemes = future.result()
                    print(f"Gathered {len(new_schemes)} schemes from {func_name}")
                    all_schemes.extend(new_schemes)
                except Exception as exc:
                    print(f"[ERROR] {func_name} generated an exception: {exc}")
    except Exception as e:
        print(f"[ERROR] Global execution error: {e}")
    finally:
        print("\nMerging results...")
    merged_dict = {}
    duplicates_removed = 0
    important_info_count = 0
    total_links = 0

    for item in all_schemes:
        if len(merged_dict) >= max_total_schemes and item['name'].lower() not in merged_dict:
            continue
            
        name_lower = item['name'].lower()

        if name_lower in merged_dict:
            existing_desc = merged_dict[name_lower].get('rawDescription', '')
            new_desc = item.get('rawDescription', '')
            
            if abs(len(new_desc) - len(existing_desc)) > 100 and new_desc and existing_desc:
                merged_dict[name_lower + "_alt"] = item
                continue

            duplicates_removed += 1
            existing_desc_len = len(existing_desc)
            new_desc_len = len(new_desc)
            
            # Keep the longer description
            # And strongly prefer items that have non-fallback important details
            has_new_important = item.get("important") and len(item["important"]) > 40 and "Eligibility: Check official website" not in item["important"]
            has_old_important = merged_dict[name_lower].get("important") and len(merged_dict[name_lower]["important"]) > 40 and "Eligibility: Check official website" not in merged_dict[name_lower]["important"]

            if new_desc_len > existing_desc_len or (has_new_important and not has_old_important):
                if not has_new_important and merged_dict[name_lower].get("important"):
                    item["important"] = merged_dict[name_lower]["important"]
                existing_links = merged_dict[name_lower].get("links", [])
                for link in existing_links:
                    if link not in item.setdefault("links", []):
                        item["links"].append(link)
                merged_dict[name_lower] = item
            else:
                if not has_old_important and item.get("important"):
                    merged_dict[name_lower]["important"] = item["important"]
                new_links = item.get("links", [])
                for link in new_links:
                    if link not in merged_dict[name_lower].setdefault("links", []):
                        merged_dict[name_lower]["links"].append(link)
        else:
            merged_dict[name_lower] = item

    print(f"Duplicates removed: {duplicates_removed}")

    final_schemes = []
    counter = 1

    for key, item in merged_dict.items():
        if len(final_schemes) >= 140:
            break
            
        scheme_links = list(set(item.get('links', []))) # Final dedupe of links
        total_links += len(scheme_links)
        
        important_text = item.get('important', '')
        if important_text and "Eligibility: Check official website" not in important_text and len(important_text) > 30:
            important_info_count += 1
            
        scheme_data = {
            "id": f"scheme_{counter}",
            "name": item['name'],
            "rawDescription": item.get('rawDescription', ''),
            "importantInfo": important_text,
            "links": scheme_links,
            "fullText": f"{item['name']} - {item.get('rawDescription', '')}",
            "source": item['source']
        }
        final_schemes.append(scheme_data)
        counter += 1

    print(f"Important info extracted for: {important_info_count} schemes")
    print(f"Useful links found: {total_links}")
    print(f"Final dataset size: {len(final_schemes)} schemes")

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
