# services/image_search.py
import requests
from typing import List
from bs4 import BeautifulSoup
import random

class ImageSearchService:
    def __init__(self):
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
        ]

    def search_recipe_images(self, recipe_name: str, num_images: int = 3) -> List[str]:
        try:
            headers = {
                'User-Agent': random.choice(self.user_agents)
            }
            
            # Using Bing Images search specifically for food images
            search_url = f"https://www.bing.com/images/search?q={recipe_name}+food+dish+recipe&qft=+filterui:photo-photo&form=IRFLTR"
            
            response = requests.get(search_url, headers=headers)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                images = []
                
                # Extract image URLs
                for img in soup.find_all('img', class_='mimg'):
                    if 'src' in img.attrs and img['src'].startswith('http'):
                        images.append(img['src'])
                    if len(images) >= num_images:
                        break
                
                # If we got some images, return them
                if images:
                    return images[:num_images]
            
            # Fallback to placeholder if no images found
            return [f"https://placehold.co/600x400?text={recipe_name.replace(' ', '+')}" 
                    for _ in range(num_images)]
                   
        except Exception as e:
            print(f"Image search error: {str(e)}")
            return [f"https://placehold.co/600x400?text={recipe_name.replace(' ', '+')}" 
                    for _ in range(num_images)]