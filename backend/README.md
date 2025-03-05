# Library Management System

This is a **Library Management System** built with **Django REST Framework (DRF)**. It includes **role-based access control (RBAC)**, **JWT authentication**, and **Postman API collection** for easy testing.

---
## Project Structure

```
📁library_project
│── 📁auth_api
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   ├── views.py
│
│── 📁library_api
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── permissions.py
│   ├── serializers.py
│   ├── urls.py
│   ├── views.py
│
│── 📁library_project
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│
│── 📁tests
│   ├── conftest.py
│   ├── pytest.ini
│   ├── test_auth.py
│   ├── test_library_api.py
│
│── .env
│── manage.py
│── Django Library Management.postman_collection.json
```

---
## Project Setup

### 1️. Clone the Repository
```bash
git clone https://github.com/your-repository/library-management.git
cd library-management
```

### 2️. Create a Virtual Environment & Activate it
```bash
python -m venv venv
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate    # On Windows
```

### 3️. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4️. Configure Environment Variables
Create a `.env` file in the root directory:
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
DATABASE_URL=sqlite:///db.sqlite3
JWT_SECRET=test
```

### 5. Apply Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser
```bash
python manage.py createsuperuser
```

### 7. Run the Development Server
```bash
python manage.py runserver
```
Server will be available at: **http://127.0.0.1:8000/**

---
## API Endpoints

### Admin Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/admin/books/` | Add a book |
| `PUT` | `/admin/books/{id}/` | Update book details |
| `DELETE` | `/admin/books/{id}/` | Delete a book |
| `GET` | `/admin/books/` | View all books |
| `GET` | `/admin/books/{id}/` | Get book details |
| `GET` | `/admin/borrowed-books/` | View borrowed books |

### User Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/books/` | Browse books |
| `POST` | `/books/{id}/borrow/` | Borrow a book |
| `POST` | `/books/{id}/return/` | Return a book |
| `GET` | `/books/history/` | View borrowing history |

---
## Postman Setup

1. Open **Postman**.
2. Click **Import** and select `Django Library Management.postman_collection.json`.
3. Open **Environments** in Postman and create a new environment:
   - Variable: `server`
   - Initial Value: `http://127.0.0.1:8000/`
4. Now, you can test all endpoints easily!

---
## Implementation Details

### Django REST Framework (DRF)
- Used for API development.
- JWT authentication via `djangorestframework-simplejwt`.
- Role-based access control (RBAC) implemented.

### Authorization
- **Admin** → Full access to manage books and borrowed records.
- **User** → Can borrow/return books and view history.

### Testing
- Implemented tests using **pytest-django**.
- Run tests using:
  ```bash
  pytest --cov=library_api --cov=auth_api --cov-report=term-missing
  ```

---
## Conclusion
This Library Management System provides a **secure and scalable** API for managing books and user borrowing history using **Django REST Framework** with **JWT authentication**. 

Contributions & feedback are welcome! 

