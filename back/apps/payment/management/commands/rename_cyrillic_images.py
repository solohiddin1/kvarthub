import os
import uuid
from django.core.management.base import BaseCommand
from apps.listings.models import ListingImage

class Command(BaseCommand):
    help = 'Rename listing images with Cyrillic characters to ASCII-safe names'

    def handle(self, *args, **options):
        images = ListingImage.objects.all()
        renamed_count = 0
        
        for img in images:
            old_path = img.image.path
            old_name = os.path.basename(old_path)
            
            # Check if filename contains non-ASCII characters
            if not old_name.isascii():
                # Generate new safe filename
                ext = old_name.split('.')[-1].lower()
                new_name = f"{uuid.uuid4().hex[:12]}.{ext}"
                new_path = os.path.join(os.path.dirname(old_path), new_name)
                
                # Rename file on disk
                if os.path.exists(old_path):
                    os.rename(old_path, new_path)
                    
                    # Update database
                    img.image.name = f"listing/images/{new_name}"
                    img.save()
                    
                    renamed_count += 1
                    self.stdout.write(f"Renamed: {old_name} -> {new_name}")
        
        self.stdout.write(self.style.SUCCESS(f'Successfully renamed {renamed_count} images'))
