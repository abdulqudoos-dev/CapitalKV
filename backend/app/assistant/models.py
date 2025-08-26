import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime
from typing import Dict, Any, List

# Dummy product data with more details
products_db = [
    {"id": "p1", "name": "Apple iPhone 14", "price": 799.99},
    {"id": "p2", "name": "Samsung Galaxy S21", "price": 699.99},
    {"id": "p3", "name": "Google Pixel 6", "price": 599.99},
    {"id": "p4", "name": "Sony Headphones", "price": 249.99},
    {"id": "p5", "name": "Bose Sound System", "price": 499.99},
    {"id": "p6", "name": "MacBook Pro 16", "price": 2399.99},
    {"id": "p7", "name": "Microsoft Surface Laptop", "price": 999.99},
    {"id": "p8", "name": "Dell XPS 13", "price": 899.99}
]

# A simple in-memory "cart database" for demonstration
user_carts: Dict[str, List[Dict[str, Any]]] = {}

# Initialize the vectorizer and transform the product names
vectorizer = TfidfVectorizer(stop_words='english')
product_names = [p["name"] for p in products_db]
product_vectors = vectorizer.fit_transform(product_names)

def search_product(query: str) -> Dict[str, Any]:
    """
    Search for the closest matching product and return its full details.
    """
    query_vector = vectorizer.transform([query])
    similarities = cosine_similarity(query_vector, product_vectors).flatten()
    
    # Get the index of the most similar product
    best_match_idx = np.argmax(similarities)
    confidence = similarities[best_match_idx]
    if confidence > 0.5:  # Only return a match if confidence is above a threshold
        return products_db[best_match_idx]
    return {}

def process_ai_query(query: str) -> Dict[str, Any]:
    """
    Simulates an AI processing a user's query and generating a response.
    """
    query_lower = query.lower()

    # Check for greetings
    if any(greeting in query_lower for greeting in ["hello", "hi", "hey"]):
        return {"response_type": "text", "text": "Hello! How can I help you today?"}

    # Check for product search queries
    elif "search for" in query_lower or "find me" in query_lower:
        search_query = query_lower.split("search for", 1)[1].strip() if "search for" in query_lower else query_lower.split("find me", 1)[1].strip()
        
        if search_query:
            product = search_product(search_query)
            if product:
                return {
                    "response_type": "product_found",
                    "text": f"I found a close match for '{search_query}'. Would you like to add the {product['name']} to your cart?",
                    "product": product
                }
            else:
                return {"response_type": "text", "text": f"Sorry, I couldn't find a product matching '{search_query}'. The products available are {', '.join(product['name'] for product in products_db)}."}
        else:
            return {"response_type": "text", "text": "Please tell me what you would like to search for."}
            
    # Check for add to cart queries (this would be a follow-up after search)
    elif "add to cart" in query_lower or "add this to cart" in query_lower:
        # This is a basic example. In a real app, you would need to get the product ID
        # from the context of the previous search result.
        return {"response_type": "text", "text": "I can't add to cart with this query. Please search for a product first."}
    
    else:
        # Fallback response for unrecognized queries
        return {"response_type": "text", "text": f"You said: '{query}'. I'm not sure how to respond to that, but I can help you find products! Try saying 'search for an iPhone'."}

def add_to_cart(user_id: str, product_id: str, quantity: int) -> bool:
    """
    Adds a product to a user's cart.
    """
    global user_carts
    if user_id not in user_carts:
        user_carts[user_id] = []
    
    # Find the product in the dummy database
    product = next((p for p in products_db if p["id"] == product_id), None)
    if product:
        # Add the product to the user's cart
        user_carts[user_id].append({"product": product, "quantity": quantity})
        print(f"Product {product['name']} added to cart for user {user_id}")
        return True
    else:
        print(f"Failed to add product with id {product_id} to cart. Product not found.")
        return False
    