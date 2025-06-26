#!/usr/bin/env python3
"""
Test script to verify image upload functionality
"""
import os
import sys
import django
from django.test import RequestFactory
from django.contrib.auth import get_user_model

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eduverse_backend.settings')
django.setup()

from posts.models import Post, PostImage
from posts.serializers import PostSerializer

def test_post_creation_without_images():
    """Test creating a post without images (should not raise KeyError)"""
    print("Testing post creation without images...")
    
    # Create a test user
    User = get_user_model()
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={'email': 'test@example.com'}
    )
    
    # Create request factory
    factory = RequestFactory()
    
    # Create a request without files
    request = factory.post('/api/posts/', {
        'content': 'Test post without images',
        'title': 'Test Post'
    })
    request.user = user
    
    # Test serializer validation
    serializer = PostSerializer(data={
        'content': 'Test post without images',
        'title': 'Test Post'
    }, context={'request': request})
    
    if serializer.is_valid():
        print("✅ Serializer validation passed for post without images")
        post = serializer.save(author=user)
        print(f"✅ Post created successfully: {post.id}")
        return True
    else:
        print(f"❌ Serializer validation failed: {serializer.errors}")
        return False

def test_post_creation_with_images():
    """Test creating a post with images"""
    print("\nTesting post creation with images...")
    
    # Create a test user
    User = get_user_model()
    user, created = User.objects.get_or_create(
        username='testuser2',
        defaults={'email': 'test2@example.com'}
    )
    
    # Create a simple test image file
    from django.core.files.uploadedfile import SimpleUploadedFile
    
    # Create a dummy image file
    image_content = b'fake-image-content'
    image_file = SimpleUploadedFile(
        "test_image.jpg",
        image_content,
        content_type="image/jpeg"
    )
    
    # Create request factory
    factory = RequestFactory()
    
    # Create a request with files
    request = factory.post('/api/posts/', {
        'content': 'Test post with images',
        'title': 'Test Post with Images'
    })
    request.user = user
    request.FILES = {'images': [image_file]}
    
    # Test serializer validation
    serializer = PostSerializer(data={
        'content': 'Test post with images',
        'title': 'Test Post with Images'
    }, context={'request': request})
    
    if serializer.is_valid():
        print("✅ Serializer validation passed for post with images")
        post = serializer.save(author=user)
        
        # Test image handling
        images = request.FILES.getlist('images')
        if len(images) == 1:
            print(f"✅ Successfully got {len(images)} image from request")
            
            # Create PostImage instance
            PostImage.objects.create(
                post=post,
                image=images[0],
                order=0
            )
            
            # Check if PostImage was created
            post_images = PostImage.objects.filter(post=post)
            if post_images.exists():
                print(f"✅ PostImage created successfully: {post_images.count()} images")
                return True
            else:
                print("❌ No PostImage created")
                return False
        else:
            print(f"❌ Expected 1 image, got {len(images)}")
            return False
    else:
        print(f"❌ Serializer validation failed: {serializer.errors}")
        return False

def test_multiple_images():
    """Test creating a post with multiple images"""
    print("\nTesting post creation with multiple images...")
    
    # Create a test user
    User = get_user_model()
    user, created = User.objects.get_or_create(
        username='testuser3',
        defaults={'email': 'test3@example.com'}
    )
    
    # Create multiple test image files
    from django.core.files.uploadedfile import SimpleUploadedFile
    
    image_files = []
    for i in range(3):
        image_content = f'fake-image-content-{i}'.encode()
        image_file = SimpleUploadedFile(
            f"test_image_{i}.jpg",
            image_content,
            content_type="image/jpeg"
        )
        image_files.append(image_file)
    
    # Create request factory
    factory = RequestFactory()
    
    # Create a request with multiple files
    request = factory.post('/api/posts/', {
        'content': 'Test post with multiple images',
        'title': 'Test Post with Multiple Images'
    })
    request.user = user
    request.FILES = {'images': image_files}
    
    # Create post first
    post = Post.objects.create(
        author=user,
        title='Test Post with Multiple Images',
        content='Test post with multiple images',
        post_type='image'
    )
    
    # Test image handling
    images = request.FILES.getlist('images')
    if len(images) == 3:
        print(f"✅ Successfully got {len(images)} images from request")
        
        # Create PostImage instances
        for index, image in enumerate(images):
            PostImage.objects.create(
                post=post,
                image=image,
                order=index
            )
        
        # Verify PostImages were created
        post_images = PostImage.objects.filter(post=post).order_by('order')
        if post_images.count() == 3:
            print(f"✅ Successfully created {post_images.count()} PostImage instances")
            for i, post_image in enumerate(post_images):
                print(f"   - Image {i+1}: {post_image.image.name} (order: {post_image.order})")
            return True
        else:
            print(f"❌ Expected 3 PostImages, got {post_images.count()}")
            return False
    else:
        print(f"❌ Expected 3 images, got {len(images)}")
        return False

if __name__ == '__main__':
    print("🧪 Testing Image Upload Functionality")
    print("=" * 50)
    
    try:
        # Test 1: Post without images
        test1_passed = test_post_creation_without_images()
        
        # Test 2: Post with single image
        test2_passed = test_post_creation_with_images()
        
        # Test 3: Post with multiple images
        test3_passed = test_multiple_images()
        
        print("\n" + "=" * 50)
        print("📊 Test Results:")
        print(f"Test 1 (No images): {'✅ PASSED' if test1_passed else '❌ FAILED'}")
        print(f"Test 2 (Single image): {'✅ PASSED' if test2_passed else '❌ FAILED'}")
        print(f"Test 3 (Multiple images): {'✅ PASSED' if test3_passed else '❌ FAILED'}")
        
        if all([test1_passed, test2_passed, test3_passed]):
            print("\n🎉 All tests passed! Image upload functionality is working correctly.")
        else:
            print("\n⚠️  Some tests failed. Please check the implementation.")
            
    except Exception as e:
        print(f"\n❌ Test failed with exception: {e}")
        import traceback
        traceback.print_exc() 