"# New Posts Feature\n\nThis document explains the new posts feature in Eduverse." 
# 📢 New Posts Feature (`new_posts_V2`)

## 🚀 Overview
The `new_posts_V2` branch introduces an improved posts feature for Eduverse. This update includes:
- 📝 **Ability to create, edit, and delete posts** via API.
- 🔒 **JWT Authentication** for secure access.
- 📡 **Optimized API endpoints** for better performance.
- 🗂 **Organized backend structure** to separate concerns.

---

## 📂 File Structure

---

## 🛠 **How to Set Up**
### 1️⃣ **Clone the Repo**
```bash
git clone https://github.com/jagan-yetukrui/Eduverse.git
cd Eduverse
git checkout new_posts_V2  # Switch to the correct branch

## ✅ **Authentication Setup**
Eduverse uses **JWT authentication** (`Simple JWT`) to secure API endpoints.

### **🔹 Login & Get an Access Token**
To authenticate, first obtain an **access token** using `/api/token/`:
```sh
curl -X POST http://127.0.0.1:8000/api/token/ -H "Content-Type: application/json" -d '{"username": "john_doe", "password": "securepassword"}'

You should see: 
{
  "refresh": "your_refresh_token_here",
  "access": "your_access_token_here"
}

✅ Fixing author Issues in Post Creation
While making POST requests to /api/posts/, we encountered errors like:

"author":["This field is required."]
"Invalid data. Expected a dictionary, but got str."
"A user with that username already exists."
🔹 Solution 1: Auto-Assign author in views.py (Best Fix)
To prevent manual assignment of author, we updated views.py to auto-assign the logged-in user: 📌 File: backend/posts/views.py
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]  # ✅ Requires authentication

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)  # ✅ Auto-assign logged-in user


🔹 Solution 2: If You Must Manually Assign author
If manual assignment is required, update the serializer to accept author: 📌 File: backend/posts/serializers.py
class PostSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), required=False)  # ✅ Allow manual assignment

    class Meta:
        model = Post
        fields = '__all__'

Final Working curl Commands
🔹 Create a Post (Auto-Assign Logged-in User)

curl -X POST http://127.0.0.1:8000/api/posts/ \
     -H "Authorization: Bearer your_access_token_here" \
     -H "Content-Type: application/json" \
     -d '{"title": "My First Post", "content": "This is a test post.", "post_type": "text"}'


What I used and the response I got:
curl -X POST http://127.0.0.1:8000/api/posts/ -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQxMDU4NTY4LCJpYXQiOjE3NDA0NTM3NjgsImp0aSI6IjZhYjNmNDI2ZDcyNDQyMzZiNmFhYzNkNzBkMjlhMDg4IiwidXNlcl9pZCI6NH0.ikKYx3YBrlxDTsHQHrCkPx-Tk6-u9sYIkw4VuFM9yTE" -H "Content-Type: application/json" -d "{\"title\": \"My First Post\", \"content\": \"This is a test post.\", \"post_type\": \"text\", \"author\": 4}"                       
{"id":14,"author":4,"comments_count":0,"likes_count":0,"title":"My First Post","content":"This is a test post.","post_type":"text","created_at":"2025-02-25T04:50:30.050043Z","updated_at":"2025-02-25T04:50:30.050043Z"}



curl -X POST http://127.0.0.1:8000/api/posts/ ^
More?      -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQyNTA0NDEyLCJpYXQiOjE3NDE4OTk2MTIsImp0aSI6IjMyOThhYTIzOTg0MDQyZTI4ZTkwOGYwOTY4ZTI4YzNiIiwidXNlcl9pZCI6NH0.KJnceQJm3xBsES4C2ZnXNwiPuFU7v-jpfXJnmXY5Zlo" ^
More?      -H "Content-Type: application/json" ^
More?      -d "{\"title\": \"My First Post\", \"content\": \"This is a test post.\", \"post_type\": \"text\"}"
{"id":17,"author":4,"comments_count":0,"likes_count":0,"title":"My First Post","content":"This is a test post.","post_type":"text","created_at":"2025-03-13T21:01:10.430334Z","updated_at":"2025-03-13T21:01:10.430334Z"}

//Update: This what I have to use to log in
curl -X POST "http://127.0.0.1:8000/api/token/" `
     -H "Content-Type: application/json" `
     -d '{"username": "john_doe", "password": "securepassword"}'


//To update a profile.
curl -X PUT http://127.0.0.1:8000/api/accounts/update-profile/ ^
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQyNTA0NDEyLCJpYXQiOjE3NDE4OTk2MTIsImp0aSI6IjMyOThhYTIzOTg0MDQyZTI4ZTkwOGYwOTY4ZTI4YzNiIiwidXNlcl9pZCI6NH0.KJnceQJm3xBsES4C2ZnXNwiPuFU7v-jpfXJnmXY5Zlo" ^
     -H "Content-Type: application/json" ^
     -d "{\"first_name\": \"John\", \"last_name\": \"Doe\", \"bio\": \"Loving life Edited!\", \"location\": \"New York\"}"


To view updates use:
  python manage.py shell
  from django.contrib.auth import get_user_model
  User = get_user_model()
  user = User.objects.get(username="john_doe")
  print(vars(user))

//Backend is the new folder for the backend commands.