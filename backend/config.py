"""
Configuration settings for the Study Agent backend.
"""

import os
from typing import Optional


class Config:
    """Base configuration."""
    
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    # API settings
    API_VERSION = 'v1'
    API_PREFIX = f'/api/{API_VERSION}'
    
    # OpenAI settings
    OPENAI_API_KEY: Optional[str] = os.environ.get('OPENAI_API_KEY')
    OPENAI_MODEL = os.environ.get('OPENAI_MODEL', 'gpt-4')
    
    # Scraping settings
    MAX_SCRAPE_DEPTH = int(os.environ.get('MAX_SCRAPE_DEPTH', '3'))
    SCRAPE_TIMEOUT = int(os.environ.get('SCRAPE_TIMEOUT', '30'))
    
    # Search settings
    SEARCH_RESULTS_LIMIT = int(os.environ.get('SEARCH_RESULTS_LIMIT', '10'))
    
    # CORS settings
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEBUG = True


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
