import os
import dj_database_url
import psycopg2
from decouple import config

# Mock settings environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

def test_connection():
    print("Testing Database Connection...")
    
    # Read from .env explicitly to debug
    db_url = config('DATABASE_URL', default='')
    print(f"DATABASE_URL found: {'Yes' if db_url else 'No'}")
    
    try:
        # Parse config safely
        db_config = dj_database_url.parse(db_url)
        
        print(f"Connecting to: {db_config['HOST']}:{db_config['PORT']}")
        print(f"User: {db_config['USER']}")
        print(f"DB Name: {db_config['NAME']}")

        conn = psycopg2.connect(
            dbname=db_config['NAME'],
            user=db_config['USER'],
            password=db_config['PASSWORD'],
            host=db_config['HOST'],
            port=db_config['PORT']
        )
        print("✅ Connection Successful!")
        conn.close()
        return True
    
    except Exception as e:
        print("❌ Connection Failed:")
        print(e)
        return False

if __name__ == "__main__":
    test_connection()
