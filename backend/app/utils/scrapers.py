from abc import ABC, abstractmethod
import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import quote, unquote
import random
import asyncio
import aiohttp
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class BaseScraper(ABC):
    def __init__(self):
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
        ]
        self.session = None

    async def get_headers(self):
        return {
            'User-Agent': random.choice(self.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.google.com/',
        }

    @abstractmethod
    async def search_images(self, recipe_name: str, num_images: int) -> List[str]:
        pass

    async def verify_image_url(self, url: str) -> bool:
        try:
            async with self.session.head(url, allow_redirects=True, timeout=5) as response:
                content_type = response.headers.get('content-type', '')
                return (response.status == 200 and 
                       'image' in content_type and 
                       not any(x in url.lower() for x in ['placeholder', 'default', 'missing']))
        except:
            return False

class GoogleScraper(BaseScraper):
    async def search_images(self, recipe_name: str, num_images: int) -> List[str]:
        search_query = f"{recipe_name} recipe food"
        url = f"https://www.google.com/search?q={quote(search_query)}&tbm=isch"
        
        try:
            async with self.session.get(url, headers=await self.get_headers()) as response:
                if response.status != 200:
                    return []
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                images = set()

                # Extract from JSON-like data in scripts
                for script in soup.find_all('script'):
                    if script.string and 'AF_initDataCallback' in script.string:
                        urls = re.findall(r'(https?://\S+\.(?:jpg|jpeg|png))', script.string)
                        images.update(unquote(url) for url in urls)

                # Verify URLs and take only valid ones
                valid_images = []
                for img_url in images:
                    if len(valid_images) >= num_images:
                        break
                    if await self.verify_image_url(img_url):
                        valid_images.append(img_url)

                return valid_images
        except Exception as e:
            logger.error(f"Google scraping error: {str(e)}")
            return []

class FoodNetworkScraper(BaseScraper):
    async def search_images(self, recipe_name: str, num_images: int) -> List[str]:
        search_query = quote(recipe_name)
        url = f"https://www.foodnetwork.com/search/{search_query}-"
        
        try:
            async with self.session.get(url, headers=await self.get_headers()) as response:
                if response.status != 200:
                    return []
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                images = set()
                
                for img in soup.find_all('img', {'data-src': True}):
                    src = img.get('data-src')
                    if src and 'thumbnail' not in src.lower():
                        images.add(src)
                
                valid_images = []
                for img_url in images:
                    if len(valid_images) >= num_images:
                        break
                    if await self.verify_image_url(img_url):
                        valid_images.append(img_url)
                
                return valid_images
        except Exception as e:
            logger.error(f"Food Network scraping error: {str(e)}")
            return []

class AllRecipesScraper(BaseScraper):
    async def search_images(self, recipe_name: str, num_images: int) -> List[str]:
        search_query = quote(recipe_name)
        url = f"https://www.allrecipes.com/search?q={search_query}"
        
        try:
            async with self.session.get(url, headers=await self.get_headers()) as response:
                if response.status != 200:
                    return []
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                images = set()
                
                for img in soup.find_all('img'):
                    src = img.get('src') or img.get('data-src')
                    if src and not any(x in src.lower() for x in ['icon', 'logo', 'advertisement']):
                        images.add(src)
                
                valid_images = []
                for img_url in images:
                    if len(valid_images) >= num_images:
                        break
                    if await self.verify_image_url(img_url):
                        valid_images.append(img_url)
                
                return valid_images
        except Exception as e:
            logger.error(f"AllRecipes scraping error: {str(e)}")
            return []

class WikimediaScraper(BaseScraper):
    async def search_images(self, recipe_name: str, num_images: int) -> List[str]:
        search_query = quote(recipe_name)
        url = f"https://commons.wikimedia.org/w/api.php"
        params = {
            "action": "query",
            "format": "json",
            "list": "search",
            "srsearch": f"{search_query} food",
            "srnamespace": "6",  # File namespace
            "srlimit": num_images
        }
        
        try:
            async with self.session.get(url, params=params, headers=await self.get_headers()) as response:
                if response.status != 200:
                    return []
                
                data = await response.json()
                images = set()
                
                for item in data.get('query', {}).get('search', []):
                    title = item.get('title', '')
                    if title.startswith('File:'):
                        file_url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{quote(title[5:])}"
                        images.add(file_url)
                
                valid_images = []
                for img_url in images:
                    if len(valid_images) >= num_images:
                        break
                    if await self.verify_image_url(img_url):
                        valid_images.append(img_url)
                
                return valid_images
        except Exception as e:
            logger.error(f"Wikimedia scraping error: {str(e)}")
            return []
        
class FoodDotComScraper(BaseScraper):
    async def search_images(self, recipe_name: str, num_images: int) -> List[str]:
        search_query = quote(recipe_name)
        url = f"https://www.food.com/search/{search_query}?pn=1"
        
        try:
            async with self.session.get(url, headers=await self.get_headers()) as response:
                if response.status != 200:
                    return []
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                images = set()
                
                # Look for recipe cards which usually contain the main images
                recipe_cards = soup.find_all('div', {'class': 'recipe-card'})
                for card in recipe_cards:
                    # Check for lazy-loaded images
                    img_tags = card.find_all('img', {'data-src': True})
                    for img in img_tags:
                        src = img.get('data-src')
                        if src:
                            # Food.com often uses different image sizes, try to get the largest
                            # Replace size parameters in URL to get larger images
                            src = re.sub(r's\d+-c', 's800-c', src)
                            images.add(src)
                    
                    # Check for regular images
                    img_tags = card.find_all('img', {'src': True})
                    for img in img_tags:
                        src = img.get('src')
                        if src and not any(x in src.lower() for x in ['icon', 'logo', 'advertisement']):
                            src = re.sub(r's\d+-c', 's800-c', src)
                            images.add(src)
                
                # If no recipe cards found, try finding images in the main content
                if not images:
                    img_tags = soup.find_all('img', {'class': 'recipe-image'})
                    for img in img_tags:
                        src = img.get('src') or img.get('data-src')
                        if src:
                            src = re.sub(r's\d+-c', 's800-c', src)
                            images.add(src)
                
                valid_images = []
                for img_url in images:
                    if len(valid_images) >= num_images:
                        break
                    if await self.verify_image_url(img_url):
                        valid_images.append(img_url)
                
                return valid_images
                
        except Exception as e:
            logger.error(f"Food.com scraping error: {str(e)}")
            return []