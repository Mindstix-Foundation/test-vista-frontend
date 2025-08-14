# ImageUploadEditor Component

A comprehensive image upload and editing component with A4 page preview, zoom controls, and crop functionality.

## Features

- **Drag & Drop Upload**: Support for drag and drop file upload
- **File Validation**: Validates file type, size, and dimensions
- **A4 Page Preview**: Shows how the image will look on an A4-sized page
- **Zoom Controls**: Plus/minus buttons to zoom in and out (10% - 300%)
- **Image Cropping**: Built-in cropping functionality using CropperJS
- **Real-time Preview**: Live preview of image with zoom and crop effects
- **Backend Integration**: Automatically uploads to your backend API
- **Error Handling**: Comprehensive error handling with user feedback

## Installation

The component requires CropperJS for image cropping functionality:

```bash
npm install cropperjs vue-cropperjs
```

## Usage

### Basic Usage

```vue
<template>
  <div>
    <button @click="showUploader = true">Upload Image</button>
    
    <ImageUploadEditor
      :isVisible="showUploader"
      @close="showUploader = false"
      @imageUploaded="handleImageUploaded"
      @error="handleError"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageUploadEditor from '@/components/common/ImageUploadEditor.vue'

const showUploader = ref(false)

const handleImageUploaded = (imageData) => {
  console.log('Image uploaded:', imageData)
  // imageData contains: { id, file, url, metadata }
}

const handleError = (message) => {
  console.error('Upload error:', message)
}
</script>
```

### With Existing Image

```vue
<ImageUploadEditor
  :isVisible="showUploader"
  :existingImageUrl="currentImageUrl"
  @close="showUploader = false"
  @imageUploaded="handleImageUploaded"
  @error="handleError"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isVisible` | `boolean` | `false` | Controls modal visibility |
| `existingImageUrl` | `string` | `''` | URL of existing image to edit |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `close` | `void` | Emitted when modal is closed |
| `imageUploaded` | `ImageData` | Emitted when image is successfully uploaded |
| `error` | `string` | Emitted when an error occurs |

### ImageData Structure

```typescript
interface ImageData {
  id: number           // Database ID from backend
  file: File          // The processed file object
  url: string         // S3 URL of uploaded image
  metadata: {
    width: number     // Image width in pixels
    height: number    // Image height in pixels
    size: number      // File size in bytes
    type: string      // MIME type
  }
}
```

## File Requirements

- **Supported formats**: JPEG, JPG, PNG, WebP
- **Size limits**: 10KB - 5MB
- **Dimension limits**: 100x100 to 4000x4000 pixels

## Backend Integration

The component integrates with your backend image upload API. Make sure you have:

1. **Image Upload Endpoint**: `POST /images/upload`
2. **Authentication**: JWT token in localStorage as 'authToken'
3. **Image Service**: The component uses `@/services/imageService`

### API Response Format

Your backend should return:

```json
{
  "id": 123,
  "image_url": "https://bucket.s3.region.amazonaws.com/images/filename.jpg",
  "original_filename": "original.jpg",
  "file_size": 102400,
  "file_type": "image/jpeg",
  "width": 800,
  "height": 600,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Integration Examples

### In Question Forms

```vue
<template>
  <form @submit.prevent="submitQuestion">
    <!-- Question text -->
    <textarea v-model="questionText" placeholder="Enter question..."></textarea>
    
    <!-- Question image -->
    <div v-if="questionImage" class="image-preview">
      <img :src="questionImage.url" alt="Question" />
      <button @click="editImage">Edit</button>
      <button @click="removeImage">Remove</button>
    </div>
    <button v-else @click="uploadImage">Add Image</button>
    
    <!-- MCQ Options with images -->
    <div v-for="(option, index) in options" :key="index">
      <input v-model="option.text" :placeholder="`Option ${index + 1}`" />
      <button @click="uploadOptionImage(index)">Add Image</button>
    </div>
    
    <button type="submit">Save Question</button>
  </form>
  
  <ImageUploadEditor
    :isVisible="showUploader"
    @close="closeUploader"
    @imageUploaded="handleImageUploaded"
    @error="showError"
  />
</template>

<script setup>
import { ref } from 'vue'
import ImageUploadEditor from '@/components/common/ImageUploadEditor.vue'

const questionText = ref('')
const questionImage = ref(null)
const options = ref([{ text: '', image: null }])
const showUploader = ref(false)
const currentContext = ref(null)

const uploadImage = () => {
  currentContext.value = { type: 'question' }
  showUploader.value = true
}

const uploadOptionImage = (index) => {
  currentContext.value = { type: 'option', index }
  showUploader.value = true
}

const handleImageUploaded = (imageData) => {
  if (currentContext.value.type === 'question') {
    questionImage.value = imageData
  } else if (currentContext.value.type === 'option') {
    options.value[currentContext.value.index].image = imageData
  }
  closeUploader()
}

const closeUploader = () => {
  showUploader.value = false
  currentContext.value = null
}

const submitQuestion = async () => {
  const payload = {
    text: questionText.value,
    imageId: questionImage.value?.id,
    options: options.value.map(opt => ({
      text: opt.text,
      imageId: opt.image?.id
    }))
  }
  
  // Submit to your API
  await submitQuestionAPI(payload)
}
</script>
```

## Styling

The component uses Bootstrap classes and custom CSS. Key style classes:

- `.image-upload-editor-overlay` - Modal overlay
- `.image-upload-editor-modal` - Main modal container
- `.a4-page` - A4 page preview container
- `.editor-toolbar` - Toolbar with controls
- `.upload-dropzone` - File drop area

## Demo

Visit `/admin/image-upload-demo` to see a working demonstration of the component.

## Dependencies

- Vue 3
- CropperJS
- Bootstrap 5 (for styling)
- Bootstrap Icons (for icons)
- Axios (for API calls)

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+ 