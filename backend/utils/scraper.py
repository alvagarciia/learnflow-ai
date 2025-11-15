"""
Web scraping utility for extracting content from URLs.
"""

import requests
from bs4 import BeautifulSoup
from typing import Optional, Dict, List
from urllib.parse import urljoin, urlparse
import time


class Scraper:
    """Web scraper for extracting content from web pages."""
    
    def __init__(self, timeout: int = 30, max_retries: int = 3):
        """
        Initialize the scraper.
        
        Args:
            timeout: Request timeout in seconds
            max_retries: Maximum number of retry attempts
        """
        self.timeout = timeout
        self.max_retries = max_retries
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def scrape_url(self, url: str) -> Optional[Dict[str, str]]:
        """
        Scrape content from a single URL.
        
        Args:
            url: The URL to scrape
            
        Returns:
            Dictionary with title, text content, and metadata, or None if failed
        """
        for attempt in range(self.max_retries):
            try:
                response = self.session.get(url, timeout=self.timeout)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Remove script and style elements
                for script in soup(['script', 'style', 'nav', 'footer', 'header']):
                    script.decompose()
                
                # Extract title
                title = soup.find('title')
                title_text = title.string if title else 'No title'
                
                # Extract main content
                text = soup.get_text(separator=' ', strip=True)
                
                # Clean up whitespace
                text = ' '.join(text.split())
                
                return {
                    'url': url,
                    'title': title_text,
                    'content': text,
                    'word_count': len(text.split())
                }
                
            except requests.exceptions.RequestException as e:
                if attempt == self.max_retries - 1:
                    print(f"Failed to scrape {url} after {self.max_retries} attempts: {e}")
                    return None
                time.sleep(1 * (attempt + 1))  # Exponential backoff
        
        return None
    
    def scrape_multiple_urls(self, urls: List[str]) -> List[Dict[str, str]]:
        """
        Scrape content from multiple URLs.
        
        Args:
            urls: List of URLs to scrape
            
        Returns:
            List of scraped content dictionaries
        """
        results = []
        for url in urls:
            result = self.scrape_url(url)
            if result:
                results.append(result)
            time.sleep(1)  # Be respectful with rate limiting
        
        return results
    
    def extract_links(self, url: str, same_domain_only: bool = True) -> List[str]:
        """
        Extract all links from a web page.
        
        Args:
            url: The URL to extract links from
            same_domain_only: If True, only return links from the same domain
            
        Returns:
            List of URLs found on the page
        """
        try:
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            base_domain = urlparse(url).netloc
            
            links = []
            for link in soup.find_all('a', href=True):
                href = link['href']
                absolute_url = urljoin(url, href)
                
                if same_domain_only:
                    if urlparse(absolute_url).netloc == base_domain:
                        links.append(absolute_url)
                else:
                    links.append(absolute_url)
            
            return list(set(links))  # Remove duplicates
            
        except requests.exceptions.RequestException as e:
            print(f"Failed to extract links from {url}: {e}")
            return []
