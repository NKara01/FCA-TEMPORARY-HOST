from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
import stripe
from api_routing import register_routes
from database import close_db, get_db
import secrets
app = Flask(__name__, 
            template_folder='../frontend/templates',
            static_folder='../frontend')

# app.secret_key = os.urandom(24)
app.secret_key = os.getenv("APP_SECRET_KEY")
# print("SECRET KEY===========:", app.secret_key)
app.teardown_appcontext(close_db)

# Database configuration its prolly wrong path. need to figure out what happened with database splitting?
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database/food_computing_academy_website.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
register_routes(app, db)
# STRIPE KEY TO BE ADDED LATER IN .ENV
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

if __name__ == '__main__':
    app.run(debug=True)